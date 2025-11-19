Function: get_menu_for_user
Input: user_id (integer or NULL)
Output: list of menu items

BEGIN
  IF user_id is NULL THEN
    FETCH all menu items WHERE is_available = TRUE AND is_vip_only = FALSE
    RETURN menu items
  END IF

  FETCH user record by user_id
  IF user status is not "ACTIVE" THEN
    RETURN empty list
  END IF

  IF user is VIP THEN
    FETCH all menu items WHERE is_available = TRUE
  ELSE
    FETCH all menu items WHERE is_available = TRUE AND is_vip_only = FALSE
  END IF

  GET recommendations for user
  MERGE menu items with recommendations
  RETURN merged result
END


Function: filter_menu
Input: menu_items (list), chef_id (integer or NULL), min_price (decimal), max_price (decimal), min_rating (decimal)
Output: filtered list of menu items

BEGIN
  CREATE empty result list

  FOR EACH item IN menu_items DO
    IF chef_id is not NULL AND item's chef_id does not equal chef_id THEN
      SKIP to next item
    END IF

    IF item price < min_price OR item price > max_price THEN
      SKIP to next item
    END IF

    IF item average rating < min_rating THEN
      SKIP to next item
    END IF

    ADD item to result list
  END FOR

  RETURN result list
END



Function: get_recommendations_for_user
Input: user (user object)
Output: list of recommended menu items

BEGIN
  FETCH all past orders for user's customer_id

  IF no past orders exist THEN
    FETCH top 5 highest-rated menu items
    RETURN top rated items
  END IF

  CREATE empty frequency map

  FOR EACH order IN past orders DO
    FETCH all order items for this order
    FOR EACH order_item IN order items DO
      IF item_id not in frequency map THEN
        SET frequency[item_id] = 0
      END IF
      INCREMENT frequency[item_id] by order_item quantity
    END FOR
  END FOR

  GET top 5 items by frequency count
  EXPAND top items to include similar items
  FILTER results by availability and VIP status
  RETURN filtered recommendations
END



Function: start_chat_session
Input: user_id (integer)
Output: chat session object

BEGIN
  CREATE new chat session
  SET session user_id = user_id
  SET session started_at = current timestamp
  SET session ended_at = NULL
  SAVE session to database
  RETURN session
END


Function: answer_question
Input: session_id (integer), sender_type (string), question_text (string)
Output: answer_text (string), source (string), kb_id (integer or NULL)

BEGIN
  FETCH chat session by session_id
  IF session has ended (ended_at is not NULL) THEN
    THROW error "Session ended"
  END IF

  CREATE new user message
  SET message session_id = session_id
  SET message sender_type = "USER"
  SET message content = question_text
  SET message source = "USER"
  SET message created_at = current timestamp
  SAVE user message to database

  SEARCH knowledge base for best match to question_text
  IF match found AND match is active THEN
    SET answer_text = knowledge base content
    SET source = "KB"
    SET kb_id = knowledge base id
  ELSE
    CALL LLM API to get answer for question_text
    SET answer_text = LLM response
    SET source = "LLM"
    SET kb_id = NULL
  END IF

  CREATE new system message
  SET message session_id = session_id
  SET message sender_type = "SYSTEM"
  SET message content = answer_text
  SET message source = source
  SET message kb_id = kb_id
  SET message created_at = current timestamp
  SAVE system message to database

  RETURN answer_text, source, kb_id
END


Function: rate_answer
Input: user_id (integer), kb_id (integer), rating_value (integer 0-5)
Output: none

BEGIN
  IF rating_value < 0 OR rating_value > 5 THEN
    THROW error "Invalid rating"
  END IF

  FETCH knowledge base entry by kb_id
  IF knowledge base entry not found THEN
    THROW error "Not found"
  END IF

  CREATE new rating record
  SET rating user_id = user_id
  SET rating kb_id = kb_id
  SET rating value = rating_value
  SET rating created_at = current timestamp
  SAVE rating to database

  FETCH all ratings for this kb_id
  CALCULATE average rating from all ratings
  COUNT how many ratings equal 0 (flags)
  UPDATE knowledge base entry:
    SET avg_rating = calculated average
    SET flag_count = count of zero ratings
    SET updated_at = current timestamp
    IF rating_value = 0 THEN
      SET is_active = FALSE
    END IF
  SAVE updated knowledge base entry
END



Function: register_customer
Input: name (string), email (string), phone (string), raw_password (string)
Output: success (boolean), message (string)

BEGIN
  CHECK if email OR phone is blacklisted
  IF blacklisted THEN
    RETURN FALSE, "Registration received"  // Silent rejection for security
  END IF

  CHECK if email already exists in database
  IF email exists THEN
    RETURN FALSE, "Email used"
  END IF

  VALIDATE password meets requirements
  IF password does not meet requirements THEN
    RETURN FALSE, "Weak password"
  END IF

  CREATE new user record
  SET user name = name
  SET user email = email
  SET user phone = phone
  SET user password_hash = hashed version of raw_password
  SET user status = "PENDING"
  SET user role = "CUSTOMER"
  SET user warning_count = 0
  SET user created_at = current timestamp
  SET user is_blacklisted = FALSE
  SAVE user to database

  CREATE new customer record
  SET customer customer_id = user's user_id
  SET customer balance = 0
  SET customer total_orders = 0
  SET customer total_spent = 0
  SET customer is_vip = FALSE
  SET customer vip_activated_at = NULL
  SAVE customer to database

  RETURN TRUE, "Pending approval"
END


Function: login
Input: email (string), raw_password (string)
Output: success (boolean), message (string), token (string or NULL)

BEGIN
  FETCH user by email
  IF user not found THEN
    RETURN FALSE, "Invalid", NULL
  END IF

  IF user is blacklisted OR user status = "TERMINATED" THEN
    RETURN FALSE, "Inactive", NULL
  END IF

  VERIFY raw_password against user's password_hash
  IF password does not match THEN
    RETURN FALSE, "Invalid", NULL
  END IF

  CREATE new session token for user_id with 30 minute expiration
  RETURN TRUE, "OK", token
END



Function: review_registration
Input: manager_id (integer), user_id (integer), decision (string), reason (string)
Output: none

BEGIN
  FETCH manager user by manager_id
  IF manager role is not "MANAGER" THEN
    THROW error "No permission"
  END IF

  FETCH user by user_id
  IF user status is not "PENDING" THEN
    THROW error "Already handled"
  END IF

  IF decision equals "APPROVE" THEN
    SET user status = "ACTIVE"
  ELSE
    SET user status = "REJECTED"
  END IF

  SAVE user to database
END



Function: add_deposit
Input: customer_id (integer), amount (decimal)
Output: success (boolean), message (string)

BEGIN
  IF amount < 10 THEN
    RETURN FALSE, "Min 10"
  END IF

  FETCH customer by customer_id
  IF customer not found THEN
    RETURN FALSE, "Not found"
  END IF

  CALL payment gateway to charge amount
  IF payment gateway charge fails THEN
    LOG transaction with status "FAILED"
    RETURN FALSE, "Payment failed"
  END IF

  INCREMENT customer balance by amount
  SAVE customer to database
  LOG transaction with status "SUCCESS"
  RETURN TRUE, "Deposit ok"
END



Function: place_order
Input: customer_id (integer), cart_items (list of cart item objects)
Output: success (boolean), message (string), order_id (integer or NULL)

BEGIN
  FETCH customer by customer_id
  FETCH user by customer_id

  IF user status is not "ACTIVE" THEN
    RETURN FALSE, "Account inactive", NULL
  END IF

  IF user warning_count >= 3 THEN
    RETURN FALSE, "Suspended", NULL
  END IF

  FOR EACH cart_item IN cart_items DO
    FETCH menu item by cart_item's item_id
    IF menu item is not available THEN
      RETURN FALSE, "Item unavailable", NULL
    END IF
  END FOR

  SET is_vip = customer's VIP status
  CHECK free delivery eligibility for customer
  CALCULATE order total based on cart_items, is_vip, is_free_delivery

  IF customer balance < total THEN
    ADD warning to user with source "ORDER" and reason "Insufficient balance"
    RETURN FALSE, "Not enough balance", NULL
  END IF

  BEGIN database transaction

  DECREMENT customer balance by total
  SAVE customer to database

  CREATE new order
  SET order customer_id = customer_id
  SET order status = "PLACED"
  SET order total_price = total
  SET order discount_applied = 0.05 if is_vip, else 0
  SET order is_free_delivery = is_free_delivery
  SET order delivery_price = computed delivery price
  SET order created_at = current timestamp
  SAVE order to database

  FOR EACH cart_item IN cart_items DO
    CREATE new order item
    SET order_item order_id = order's order_id
    SET order_item item_id = cart_item's item_id
    SET order_item quantity = cart_item's quantity
    FETCH menu item price
    SET order_item unit_price = menu item price
    SAVE order_item to database
  END FOR

  COMMIT database transaction

  INCREMENT customer total_orders by 1
  INCREMENT customer total_spent by total
  SAVE customer to database

  CHECK if customer qualifies for VIP upgrade
  OPEN bidding window for this order

  RETURN TRUE, "Order placed", order's order_id
END


Function: calculate_order_total
Input: cart_items (list), is_vip (boolean), is_free_delivery (boolean)
Output: total (decimal)

BEGIN
  SET subtotal = 0

  FOR EACH cart_item IN cart_items DO
    FETCH menu item by cart_item's item_id
    INCREMENT subtotal by (item price × cart_item quantity)
  END FOR

  IF is_vip THEN
    SET discount = subtotal × 0.05
  ELSE
    SET discount = 0
  END IF

  SET taxes = subtotal × TAX_RATE

  IF is_free_delivery THEN
    SET delivery_fee = 0
  ELSE
    SET delivery_fee = BASE_DELIVERY_FEE
  END IF

  SET total = subtotal - discount + taxes + delivery_fee
  ROUND total to 2 decimal places
  RETURN total
END


Function: check_free_delivery_eligibility
Input: customer (customer object)
Output: eligible (boolean)

BEGIN
  IF customer is not VIP THEN
    RETURN FALSE
  END IF

  IF (customer total_orders + 1) is divisible by 3 THEN
    RETURN TRUE
  END IF

  RETURN FALSE
END



Function: open_bidding
Input: order_id (integer)
Output: none

BEGIN
  FETCH order by order_id
  SET order status = "AWAITING_BIDS"
  SAVE order to database

  FETCH all available delivery persons
  FOR EACH delivery_person IN available delivery persons DO
    SEND notification to delivery_person about new order
  END FOR

  OPEN bidding window for order_id with 5 minute duration
END


Function: submit_bid
Input: delivery_person_id (integer), order_id (integer), bid_amount (decimal), eta_minutes (integer)
Output: success (boolean), message (string)

BEGIN
  CHECK if bidding window is still open for order_id
  IF bidding window is closed THEN
    RETURN FALSE, "Window closed"
  END IF

  FETCH order by order_id
  IF order status is not "AWAITING_BIDS" THEN
    RETURN FALSE, "Not accepting"
  END IF

  CREATE new delivery bid
  SET bid order_id = order_id
  SET bid delivery_id = delivery_person_id
  SET bid bid_amount = bid_amount
  SET bid eta_minutes = eta_minutes
  SET bid created_at = current timestamp
  SET bid is_selected = FALSE
  SAVE bid to database

  COUNT total bids for this order
  IF bid count >= 3 THEN
    CLOSE bidding window for order_id
  END IF

  RETURN TRUE, "Bid ok"
END


Function: close_bidding
Input: order_id (integer)
Output: none

BEGIN
  CLOSE bidding window for order_id
  FETCH all bids for order_id

  IF no bids exist THEN
    RETURN
  END IF

  SORT bids by bid_amount (ascending)
  NOTIFY manager with sorted bid list for order_id
END



Function: assign_delivery
Input: manager_id (integer), order_id (integer), selected_bid_id (integer or NULL), memo_text (string)
Output: none

BEGIN
  FETCH manager user by manager_id
  IF manager role is not "MANAGER" THEN
    THROW error "No permission"
  END IF

  FETCH all bids for order_id

  IF no bids exist THEN
    FETCH any available delivery person
    IF no delivery person available THEN
      THROW error "No delivery person"
    END IF
    SET selected_delivery_id = delivery person's delivery_id
  ELSE
    FETCH selected bid by selected_bid_id
    FIND lowest bid from all bids

    IF selected bid amount > lowest bid amount THEN
      IF memo_text is NULL OR memo_text is empty THEN
        THROW error "Memo needed"
      END IF

      CREATE new manager memo
      SET memo manager_id = manager_id
      SET memo order_id = order_id
      SET memo employee_id = selected bid's delivery_id
      SET memo memo_type = "DELIVERY_BID_OVERRIDE"
      SET memo content = memo_text
      SET memo created_at = current timestamp
      SAVE memo to database
    END IF

    SET selected_delivery_id = selected bid's delivery_id
  END IF

  FETCH order by order_id
  SET order delivery_id = selected_delivery_id
  SET order status = "READY_FOR_DELIVERY"
  SAVE order to database

  IF bids exist THEN
    SET selected bid is_selected = TRUE
    SAVE selected bid to database
  END IF
END



Function: update_order_status
Input: delivery_person_id (integer), order_id (integer), new_status (string)
Output: none

BEGIN
  FETCH order by order_id
  IF order's delivery_id does not equal delivery_person_id THEN
    THROW error "Not assigned"
  END IF

  IF new_status equals "OUT_FOR_DELIVERY" THEN
    SET order status = "OUT_FOR_DELIVERY"
    SET order picked_up_at = current timestamp
    SAVE order to database
  ELSE IF new_status equals "DELIVERED" THEN
    SET order status = "DELIVERED"
    SET order delivered_at = current timestamp
    SAVE order to database

    FETCH delivery person by delivery_person_id
    INCREMENT delivery person balance by order's delivery_price
    SAVE delivery person to database
  END IF
END



Function: submit_order_rating
Input: customer_id (integer), order_id (integer), food_rating (integer 1-5), delivery_rating (integer 1-5), comment (string)
Output: success (boolean), message (string)

BEGIN
  FETCH order by order_id

  IF order's customer_id does not equal customer_id THEN
    RETURN FALSE, "Not your order"
  END IF

  IF order status is not "DELIVERED" THEN
    RETURN FALSE, "Not delivered"
  END IF

  CHECK if rating already exists for this order
  IF rating exists THEN
    RETURN FALSE, "Already rated"
  END IF

  IF food_rating < 1 OR food_rating > 5 OR delivery_rating < 1 OR delivery_rating > 5 THEN
    RETURN FALSE, "Invalid"
  END IF

  FETCH customer by customer_id
  IF customer is VIP THEN
    SET weight = 2
  ELSE
    SET weight = 1
  END IF

  CREATE new rating
  SET rating order_id = order_id
  SET rating menu_item_id = NULL
  SET rating deliver_id = order's delivery_id
  SET rating rater_id = customer_id
  SET rating rating_food = food_rating
  SET rating rating_delivery = delivery_rating
  SET rating weight = weight
  SET rating comment = comment
  SET rating created_at = current timestamp
  SAVE rating to database

  UPDATE employee statistics after rating for order_id
  RETURN TRUE, "Thanks"
END


Function: update_employee_stats_after_rating
Input: order_id (integer)
Output: none

BEGIN
  FETCH order by order_id
  FETCH rating by order_id

  FETCH all order items for order_id
  FOR EACH order_item IN order items DO
    FETCH menu item by order_item's item_id
    FETCH chef by menu item's chef_id
    FETCH all ratings for this chef
    CALCULATE weighted average of food ratings
    SET chef avg_rating = calculated average
    SET chef rating_count = count of ratings
    SAVE chef to database
  END FOR

  FETCH delivery person by order's delivery_id
  FETCH all ratings for this delivery person
  CALCULATE weighted average of delivery ratings
  SET delivery person avg_rating = calculated average
  SET delivery person rating_count = count of ratings
  SAVE delivery person to database

  FETCH all ratings by this rater_id
  COUNT ratings where food_rating = 1 AND delivery_rating = 1
  IF abuse count > ABUSE_THRESHOLD THEN
    FLAG rater for abuse
  END IF

  EVALUATE employee performance for delivery person
END



Function: file_complaint
Input: from_user_id (integer), against_user_id (integer), target_type (string), complaint_type (string), description (string), order_id (integer)
Output: none

BEGIN
  FETCH user by from_user_id

  CREATE new complaint
  SET complaint from_user_id = from_user_id
  SET complaint against_user_id = against_user_id
  SET complaint target_type = target_type
  SET complaint complaint_type = complaint_type
  SET complaint description = description
  SET complaint order_id = order_id
  SET complaint status = "PENDING"
  SET complaint created_at = current timestamp
  IF user is VIP THEN
    SET complaint weight = 2
  ELSE
    SET complaint weight = 1
  END IF
  SAVE complaint to database
END


Function: file_compliment
Input: from_user_id (integer), to_user_id (integer), comment (string), order_id (integer)
Output: none

BEGIN
  CREATE new compliment
  SET compliment from_user_id = from_user_id
  SET compliment to_user_id = to_user_id
  SET compliment comment = comment
  SET compliment order_id = order_id
  SET compliment created_at = current timestamp
  SAVE compliment to database
END


Function: resolve_complaint
Input: manager_id (integer), complaint_id (integer), decision (string), decision_note (string), is_critical (boolean)
Output: none

BEGIN
  FETCH manager user by manager_id
  IF manager role is not "MANAGER" THEN
    THROW error "No permission"
  END IF

  FETCH complaint by complaint_id
  IF complaint status is not "PENDING" THEN
    THROW error "Handled"
  END IF

  SET complaint manager_id = manager_id
  SET complaint decision_note = decision_note
  SET complaint resolved_at = current timestamp

  IF decision equals "UPHOLD" THEN
    SET complaint status = "UPHELD"
    ADD warning to against_user_id with source "COMPLAINT" and reason = complaint_type
    CHECK warning threshold for against_user_id
    IF is_critical is TRUE THEN
      SUSPEND user immediately for against_user_id
    END IF
  ELSE
    SET complaint status = "DISMISSED"
  END IF

  SAVE complaint to database
END



Function: add_warning_to_user
Input: user_id (integer), source (string), reason (string)
Output: none

BEGIN
  CREATE new warning
  SET warning user_id = user_id
  SET warning source = source
  SET warning reason = reason
  SET warning created_at = current timestamp
  SAVE warning to database

  FETCH user by user_id
  INCREMENT user warning_count by 1
  SAVE user to database

  HANDLE warning added to customer for user_id
  HANDLE warning added to employee for user_id
END


Function: check_warning_threshold
Input: user_id (integer)
Output: none

BEGIN
  FETCH user by user_id

  IF user role equals "CUSTOMER" AND user warning_count >= 3 THEN
    TERMINATE and BLACKLIST customer for user_id
  ELSE IF (user role equals "CHEF" OR user role equals "DELIVERY") AND user warning_count >= 3 THEN
    FIRE employee for user_id with reason "Too many warnings"
  END IF
END



Function: evaluate_employee
Input: employee_id (integer)
Output: none

BEGIN
  FETCH all ratings for employee_id

  IF no ratings exist THEN
    RETURN
  END IF

  CALCULATE weighted average of rating values
  COUNT upheld complaints against employee_id
  COUNT compliments for employee_id
  CALCULATE net_complaints = MAX(complaints - compliments, 0)

  IF average < 2 OR net_complaints >= 3 THEN
    NOTIFY manager to demote employee_id
  ELSE IF average > 4 OR compliments >= 3 THEN
    NOTIFY manager to give bonus to employee_id
  END IF
END


Function: apply_demotion_or_bonus
Input: employee_id (integer), manager_id (integer), action (string), memo_text (string)
Output: none

BEGIN
  FETCH manager user by manager_id
  IF manager role is not "MANAGER" THEN
    THROW error "No permission"
  END IF

  FETCH employee by employee_id

  IF action equals "DEMOTE" THEN
    SET employee employment_status = "DEMOTED"
    INCREMENT employee demotion_count by 1
    SET employee salary = employee salary × 0.8
  ELSE IF action equals "BONUS" THEN
    SET employee salary = employee salary × 1.1
  END IF

  SAVE employee to database

  CREATE new manager memo
  SET memo manager_id = manager_id
  SET memo employee_id = employee_id
  SET memo memo_type = "PERFORMANCE_" + action
  SET memo content = memo_text
  SET memo created_at = current timestamp
  SAVE memo to database

  IF action equals "DEMOTE" AND employee demotion_count >= 2 THEN
    FIRE employee for employee_id with reason "Max demotions"
  END IF
END


Function: fire_employee
Input: employee_id (integer), reason (string)
Output: none

BEGIN
  FETCH employee by employee_id
  SET employee employment_status = "FIRED"
  SAVE employee to database

  FETCH user by employee_id
  SET user status = "TERMINATED"
  SAVE user to database

  CREATE new manager memo
  SET memo manager_id = current manager id
  SET memo employee_id = employee_id
  SET memo memo_type = "TERMINATION"
  SET memo content = reason
  SET memo created_at = current timestamp
  SAVE memo to database
END



Function: check_vip_upgrade
Input: customer_id (integer)
Output: none

BEGIN
  FETCH customer by customer_id
  FETCH user by customer_id

  IF customer is already VIP THEN
    RETURN
  END IF

  IF user status is not "ACTIVE" THEN
    RETURN
  END IF

  CHECK if customer has pending complaints
  IF has pending complaints THEN
    RETURN
  END IF

  SET condition1 = customer total_spent > 100
  SET condition2 = (customer total_orders >= 3 AND user warning_count = 0)

  IF condition1 OR condition2 THEN
    SET customer is_vip = TRUE
    SET customer vip_activated_at = current timestamp
    SAVE customer to database
  END IF
END


Function: handle_warning_added_to_customer
Input: user_id (integer)
Output: none

BEGIN
  FETCH user by user_id

  IF user role is not "CUSTOMER" THEN
    RETURN
  END IF

  FETCH customer by user_id

  IF customer is VIP AND user warning_count >= 2 THEN
    SET customer is_vip = FALSE
    SAVE customer to database
    SET user warning_count = 0
    SAVE user to database
  END IF

  IF user warning_count >= 3 THEN
    TERMINATE and BLACKLIST customer for user_id
  END IF
END


Function: terminate_and_blacklist_customer
Input: user_id (integer)
Output: none

BEGIN
  FETCH user by user_id
  FETCH customer by user_id

  IF customer balance > 0 THEN
    ISSUE refund for customer balance via payment gateway
    SET customer balance = 0
    SAVE customer to database
  END IF

  SET user status = "TERMINATED"
  SET user is_blacklisted = TRUE
  SAVE user to database

  ADD user email and phone to blacklist
END


Function: close_customer_account
Input: manager_id (integer), customer_id (integer)
Output: none

BEGIN
  FETCH manager user by manager_id
  IF manager role is not "MANAGER" THEN
    THROW error "No permission"
  END IF

  FETCH customer by customer_id
  FETCH user by customer_id

  IF customer balance > 0 THEN
    ISSUE refund for customer balance via payment gateway
    SET customer balance = 0
    SAVE customer to database
  END IF

  SET user status = "CLOSED"
  SAVE user to database
END



Function: is_blacklisted
Input: email (string), phone (string)
Output: blacklisted (boolean)

BEGIN
  CHECK if email exists in blacklist
  IF email exists THEN
    RETURN TRUE
  END IF

  CHECK if phone exists in blacklist
  IF phone exists THEN
    RETURN TRUE
  END IF

  RETURN FALSE
END


Function: add_to_blacklist
Input: email (string), phone (string)
Output: none

BEGIN
  CHECK if email OR phone already exists in blacklist
  IF not exists THEN
    CREATE new blacklist entry
    SET entry email = email
    SET entry phone = phone
    SET entry created_at = current timestamp
    SAVE entry to database
  END IF
END
