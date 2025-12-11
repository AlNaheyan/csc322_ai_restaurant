const { DiscussionTopic, DiscussionPost, User, Complaint } = require('../models');
const { Op } = require('sequelize');

class DiscussionService {
  async getAllTopics(filters = {}) {
    const where = {};

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.target_type) {
      where.target_type = filters.target_type;
    }

    const topics = await DiscussionTopic.findAll({
      where,
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['user_id', 'first_name', 'last_name', 'email']
        },
        {
          model: DiscussionPost,
          attributes: ['post_id'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return topics.map(topic => ({
      ...topic.toJSON(),
      post_count: topic.DiscussionPosts ? topic.DiscussionPosts.length : 0,
      DiscussionPosts: undefined
    }));
  }

  async getTopicById(topicId) {
    const topic = await DiscussionTopic.findByPk(topicId, {
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['user_id', 'first_name', 'last_name', 'email']
        },
        {
          model: DiscussionPost,
          include: [
            {
              model: User,
              as: 'Author',
              attributes: ['user_id', 'first_name', 'last_name', 'email', 'role']
            }
          ],
          order: [['created_at', 'ASC']]
        }
      ]
    });

    if (!topic) {
      throw new Error('Discussion topic not found');
    }

    return topic;
  }

  async createTopic(userId, topicData) {
    const { title, category, target_type, target_id } = topicData;

    if (!title || title.trim().length === 0) {
      throw new Error('Title is required');
    }

    const topic = await DiscussionTopic.create({
      created_by: userId,
      title: title.trim(),
      category: category || 'general',
      target_type,
      target_id
    });

    return await this.getTopicById(topic.topic_id);
  }

  async createPost(userId, topicId, content) {
    if (!content || content.trim().length === 0) {
      throw new Error('Post content is required');
    }

    const topic = await DiscussionTopic.findByPk(topicId);

    if (!topic) {
      throw new Error('Discussion topic not found');
    }

    if (topic.is_locked) {
      throw new Error('This topic is locked and cannot accept new posts');
    }

    const post = await DiscussionPost.create({
      topic_id: topicId,
      author_id: userId,
      content: content.trim()
    });

    return await DiscussionPost.findByPk(post.post_id, {
      include: [
        {
          model: User,
          as: 'Author',
          attributes: ['user_id', 'first_name', 'last_name', 'email', 'role']
        }
      ]
    });
  }

  async lockTopic(topicId) {
    const topic = await DiscussionTopic.findByPk(topicId);

    if (!topic) {
      throw new Error('Discussion topic not found');
    }

    await topic.update({ is_locked: true });
    return topic;
  }

  async unlockTopic(topicId) {
    const topic = await DiscussionTopic.findByPk(topicId);

    if (!topic) {
      throw new Error('Discussion topic not found');
    }

    await topic.update({ is_locked: false });
    return topic;
  }

  async reportPost(postId, reporterId, reason) {
    const post = await DiscussionPost.findByPk(postId, {
      include: [
        {
          model: User,
          as: 'Author',
          attributes: ['user_id', 'first_name', 'last_name']
        }
      ]
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.author_id === reporterId) {
      throw new Error('You cannot report your own post');
    }

    const complaint = await Complaint.create({
      filer_id: reporterId,
      subject_id: post.author_id,
      subject_type: 'customer',
      complaint_type: 'complaint',
      category: 'discussion_post',
      description: `Inappropriate behavior in discussion forum. Post content: "${post.content.substring(0, 100)}..."\n\nReason: ${reason}`,
      status: 'pending'
    });

    await post.update({ is_reported: true });

    return {
      message: 'Post reported successfully. A manager will review it.',
      complaint_id: complaint.complaint_id
    };
  }

  async deleteTopic(topicId, userId, userRole) {
    const topic = await DiscussionTopic.findByPk(topicId);

    if (!topic) {
      throw new Error('Discussion topic not found');
    }

    if (userRole !== 'manager' && topic.created_by !== userId) {
      throw new Error('You can only delete your own topics');
    }

    await topic.destroy();
    return { message: 'Topic deleted successfully' };
  }

  async deletePost(postId, userId, userRole) {
    const post = await DiscussionPost.findByPk(postId);

    if (!post) {
      throw new Error('Post not found');
    }

    if (userRole !== 'manager' && post.author_id !== userId) {
      throw new Error('You can only delete your own posts');
    }

    await post.destroy();
    return { message: 'Post deleted successfully' };
  }
}

module.exports = new DiscussionService();
