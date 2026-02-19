# FED_Assignment
ShiokLah! Web Application
github fed

# Account Credentials:
Patron
Username: ben_tan
Password: abcd12345

NEA Officer
Username: james_lee
Password: abcd123456

# Existing features

Priscilla:
NOTE : The flow starts from SelectRole.html
NOTE : The Javascript for all the html files except for PaymentSuccess.html(inline js) and PaymentFailed.html(inline js) are in Master_page_javascript.js
User Account Management
Feature 1 : Users can choose to log in as a patron, vendor or NEA officer, allowing each user to save personalised details such as order history for patrons for future use and bring each user to their respective pages without clashing. -> Refer to SelectRole.html
Feature 2 : Vendors can create accounts to manage stalls, menus, and orders, patrons can also create accounts or log in as a guest to order food. Messages will be shown for successful creation of account, taken username, if password does not meet the set rule (Must be 9+ chars with letters & numbers only), if passwords typed do not match, if the username is in an invalid format (can only contain letters, numbers, dot and underscore) etc. This helps to ensure that username and password are in the correct format and that users cannot duplicate accounts sharing the same username. It also allows users to create accounts that can store their information for future use. -> Refer to register.html
Feature 3 :  Vendors, patrons and NEA officers can reset their passwords if they forget it which includes a finding their account page, ensuring that only existing accounts can have their passwords reset. A message will be shown if the account cannot be found. -> Refer to FindAccount.html
Feature 4: A security verification page after successfully finding the account to ensure that only the respective users can log into their accounts (A code will be sent to their email but for demonstration purposes, an alert is shown instead with the random generated code). There is also a resend code button in case the user did not receive the first code. A message will be shown if the code is incorrect. This helps to verify that only the actual user can change their password and also allows for users to be able to change their password even if they faced issues in receiving the code the first few times. -> Refer to ConfirmAccount.html
Feature 5: A password reset page at the end. Messages will be shown if the passwords typed in do not match, password field is empty or the password does not meet the set rule (Must be 9+ chars with letters & numbers only). A message will also be shown if password reset was successful. This allows users to have more secure passwords and checks that they know what their password is. It also helps to inform users that their password was reset successfully and they can proceed. -> Refer to ChangePassword.html
Ordering & Checkout
Feature 1 : Patrons can view the stalls in the homepage, giving patrons a variety of cuisines and food items to choose from. -> Refer to FED_ASG.html
Feature 2 : Patrons can filter stalls based on cuisine (Note: Click on the “Chinese” picture), allowing patrons to narrow stalls down to a cuisine of their choice. To see the all the stalls again, click on the selected cuisine once more. -> Refer to FED_ASG.html
Feature 3 : Patrons can search for stalls using the search bar, allowing for easier navigation of a particular stall. -> Refer to FED_ASG.html
Feature 4 : Patrons can click on stalls and view their menus. (Note: Only “Banana Leaf Nasi Lemak” & “Boon Lay Fried Carrot Cake & Kway Teow Mee” have menu items), allowing patrons to pick which item they would like to order. (Note: You must be on FED_ASG.html and select a stall from there in order for the menus to load. If you directly open FoodStalls.html, the menus will not load). -> Menus are in FoodStalls.html (Note: FoodStalls.html back button (looks like an arrow) will only work if you were on FED_ASG.html before clicking on the food stall and being redirected to FoodStalls.html).
Feature 5 : Patrons can add items into their cart and remove them, allowing for more customisation of what items they want to order and in what quantity. -> Refer to FoodStalls.html and OrderSummary.html
Feature 6 : Patrons can checkout, choose their preferred order type (i.e. self-pickup or dine-in) -> (Refer to OrderSummary.html) and payment success or failure will be displayed. -> (Refer to PaymentSucess.html and PaymentFailed.html) This allows patrons tailor the order type to their own needs and also shows them whether their payment went through or not. (Note: The "Add a card" payment method does not actually let you add a card and if it is selected, you will be redirected to the payment failed page. The remaining payment methods will all bring you to the payment success page.) (Note: OrderSummary back button (looks like an arrow) will only work if you were on FoodStalls.html before clicking on the cart and being redirected to OrderSummary.html).
Feature 8 : Mobile and desktop view completed for all features.

Valene:
1. Order History
Displays users’ past orders retrieved from Firebase Realtime Database
Shows ordered items, quantities, and timestamps
Updates Orders automatically when user orders

2. Analytics & Reporting
Sales Analytics
Uses real-time order data from Firebase
Displays top-selling items
Supports time filters (this month, last 3 months, last 6 months)

3. Customer Feedback Analysis
Uses simulated feedback data stored in Firebase
Visualised using a doughnut chart (positive, neutral, negative)

4. Hygiene & Inspection Monitoring
Displays hygiene grades (A–D) over time
Visualised using a line chart
Filterable by year

5. User Profile
Profile for registered user and guest user
View personal information of registered users
Act as a central navigation hub for features (favourites, analytics, rewards, log in and register)

6. Responsive & Mobile Navigation
Includes a hamburger menu for mobile devices
Navigation adapts between desktop and mobile layouts
Ensures usability across devices

Ethan:
Regulatory & Compliance:
Inspection scheduling and logging by NEA officers
View a list of inspections that are slated as upcoming and/or completed months ago, with filters

Record inspection scores, remarks, and hygiene grades
The most recent inspection can accept data in a web form per stall and determine their hygiene grade to be issued, based on several factors rated in percentages
Cleanliness, Handling and Efficiency
The average percentage for the stall sets the hygiene grade (A, B, C) based on a percentage range

Display historical hygiene grades for transparency
Previous inspections with historical stalls' hygiene grades and ratings can be viewed

Aadya:
Feature 1: Loyalty programs or discounts
1) When Checking out,(OrderSummary.html-> NOT my HTML but I have one part in the order summary page that links to my feature) users are able to see a "Go to Rewards" link under the Subtotal. Once they click that, it would lead them to their Vouchers and Rewards page(Customers Vouchers and Rewards.html)
2) Users are able to put it valid promo codes. Invalid promo codes would leave an error message(-- Type SAVE45 to see error message). Valid promo codes would immediately lead the user to the check-out page with the some amount deducted according to the promo code(-- Type HELLO123 to see). Once a promo code has been used, users are unable to use it again.
3) Available vouchers are displayed below the promo code section. Users can use the voucher anytime while they are checking out. If they are able to use the voucher, it would directly lead them to the order summary page again(OrderSummary.html-> NOT my HTML but my fetaure is linked to this HTML), and deduct the total amount according to the voucher. If voucher has a minimum spending criteria and the user does not meet the criteria, an error message will be shown and user won't be able to use the voucher.
4) Spin the wheel feature. Mainly for users entertainment. Users are only allowed to spin the wheel every 48 hours. When they land on a voucher it would be automatically added in the list of vouchers.

Feature 2: Real-time order tracking
1) When users have paid for their order, they would be able to see 2 options.(Review Order and Back to Homepage). When users click the Review Order option, they would be directed to their status of order summary(Order_Tracking.html)(the ETA of their food). 
2) There is also a match the cards game they can play at the bottom while waiting for thier food for their own entertainment 

Feature 3: Feedback submission (ratings + comments) 
Once users are done with their meals, they are able to give a feedback to the stalls(Customer_ReviewPage.html) and enter their feedback then just submit it. Once they are doen submitting, they would be redirected to the homepage(FED.HTML) again.


Feature 4: Likes for individual menu items
1) When users are in the midst of deciding what they want to order and are indecisive about it, they can easily like the menu items by clicking on the red heart at the bottom of each item. 
2) The liked items would then be added into the favourites page under Profile in the navigation bar (Customer_Favourties.html)

Feature 5: Notification for promotions
When customers get new vouchers, they will get a notification pop up at the top of their screen, and the voucher would be added into the list of their vouchers

Feature 6: Complaint submission linked to stalls.
If users are very dissatisfied with their meals or the environment and service, they can put in a complaint by going into the (Feedback page), there is a link to a complaint form. When users click on the link they would be directed to the complaint form(CustomerComplaintForm.html) where they can put in their details and their complaint. When they submit, they would be directed to the homepage again.

Si Ying:
Edit menu item details, such as the dish’s name, price, estimated waiting time, update menu item’s image etc.
Delete menu item, customer view will then not be able to see the menu item.

Choose whether menu item will appear in customer’s menu page, for events such as promotions that may require the menu item again. This saves the hassle of recreating a repeated promotion menu item by clicking on the visibility logo. When the vendor toggles the btn, the menu item will habe a lower opacity and will be put to the bottom of the menu item
Choose whether menu item will appear in customer’s menu page, for events such as promotions that may require the menu item again. This saves the hassle of recreating a repeated promotion menu item
Edit menu item details, such as the dish’s name, price, estimated waiting time, update menu item’s image etc.
Delete menu item

Stall performance dashboard.
Displays number of orders etc, which can be filtered with the dropdown menu

Rental agreement tracking (renewals, changes)
Vendor can see the rental agreement end date, if the rental agreement is expiring in 6 months or lesser, the status becomes pending renewal. If the end date has passed, the status becomes expired. Otherwise, active. For renewal of rental agreements, the vendor have to key in addr, centre name, comments etc in order to renew rental agreement. 

Digital queue management
Description:

Choose whether to accept or reject incoming orders, then update whether order is completed or cancel order
When new orders are sent, the vendor will see a notification of either “#Order00003 is ready for confirmation!”, but only in that page

Feedback
Description:
Shows customer’s feedbacks such as complaints to vendor
Displays number of customers, % of menu items sold and average revenue of the stall owner depending on the time frame selected.
Time frame is chosen from using the dropdown menu beside the title of the charts shown
Varying tips to boost sales are recommended depending on the dataset

Digital queue management:
Choose whether to accept or reject incoming orders, then update whether order is completed or cancel order

Feedback
Description:
Shows customer’s feedbacks such as complaints to vendor
Displays number of customers, % of menu items sold and average revenue of the stall owner depending on the time frame selected.
Time frame is chosen from using the dropdown menu beside the title of the charts shown
Varying tips to boost sales are recommended depending on the dataset

Digital queue management:
Choose whether to accept or reject incoming orders, then update whether order is completed or cancel order
Real-time notifications (only in that page) for vendors (new orders).

# Features to implement in the future
Priscilla:
Feature 1 : Add in a description for menu items.
Feature 2 : Create more menus for the other food stalls.
Feature 3 : Add in more food stalls.

Aadya:
Feature 1 : Add a "Go to Favourites" button in my cmenu page so when users like a menu item, they would be able to just directly go to the favourites page without exiting the menu page.
Feature 2 : In each of the menu items in the favourites page, add a "+" and "-" which is linked to cart so if they do want to add their liked item to cart they won't have to go back to the menu to add it.

Valene:
1.Adding orderID and quantities of food item to Order History.
2.Making my code more efficient so that the website can run faster.

Si Ying:
- Order Limit for Vendors. Vendors can set a limit to orders, and when the order limit has reached, the stall becomes unclickable, and a message will display that the stall has reached max orders
- Feedback, Shows customer’s feedbacks such as complaints to vendor
- Notification for when new feedbacks or orders are sent, the vendor will see a notification of either “#Order00003 is ready for confirmation!” or “You have received a feedback!” depending on the scenarios



# Technologies Used
HTML5 – Page structure and layout
CSS3 – Styling, layout, and responsive design
JavaScript (ES Modules) – Application logic and interactivity
Firebase Realtime Database – Real-time data storage and retrieval
Chart.js – Data visualisation (bar, doughnut, line charts)
Responsive Web Design – Desktop and mobile support
Google Fonts – Custom typography (Kodchasan,Roboto)

Languages used :
HTML
CSS
Javascript
JSON


# Testing
Verified all page’s load correctly without runtime errors
Tested Firebase real-time data retrieval and updates
Verified charts update correctly when filters change
Tested responsive layout on desktop and mobile screen sizes
Tested navigation menu and hamburger menu functionality

# Deployment
GitHub Pages link: https://valenechia08.github.io/FED_Assignment/
GitHub link: https://github.com/valenechia08/FED_Assignment.git
Deployment Process:
Create new Repository, go to Repository Settings then Pages. Select main branch and root folder. Save and access the generated GitHub Pages link.
Local Setup:
Clone the repository in Visual Studio Code and can start creating HTML and java scripts
Open live server to view HTML files
Database Setup:
Firebase Realtime Database – Create project by selecting Realtime Database.
Store and retrieve users, orders, hygiene grade, feedback, menu, stalls data.
Update Firebase configuration in the JavaScript files
Chart JS:
Charts and analytics load using a public CDN.




# Credits
Firebase Realtime Database – data storage and real-time updates
Chart.js – data visualisation library
Google Fonts – Kodchasan font
External libraries were loaded using a public CDN for convenience.


Google fonts used:
Roboto
<link
    href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100..900&family=Open+Sans:wght@300..800&family=Roboto:wght@100..900&display=swap"
    rel="stylesheet"
/>
Kodchasan
<link
    href="https://fonts.googleapis.com/css2?family=Kodchasan:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,200;1,300;1,400;1,500;1,600;1,700&display=swap"
    rel="stylesheet"
/>

Pictures used:
dumplings picture - Bing. (n.d.). Bing. https://www.bing.com/images/search?view=detailV2&ccid=IUfRXvpt&id=600AC0F8185BEB533CC6093EF9D65A817389FEBC&thid=OIP.IUfRXvptjsMuk83107pcFAHaEa&mediaurl=https%3A%2F%2Fimages.pexels.com%2Fphotos%2F955137%2Fpexels-photo-955137.jpeg%3Fcs%3Dsrgb%26dl%3Dpexels-catscoming-955137.jpg%26fm%3Djpg&exph=3080&expw=5159&q=dumplings+picture&form=IRPRST&ck=C069AE51162942CCD68BEF240F1029CC&selectedindex=20&itb=0&cw=1145&ch=601&ajaxhist=0&ajaxserp=0&vt=2&sim=11


Paradise, N., & Suthakar, I. (2022, July 9). Malaysian food: 18 Traditional and popular dishes to try. Nomad Paradise. https://nomadparadise.com/malaysian-food/


Lim, G. (2023, October 17). Vivian Lai “Lookalike” Nasi Lemak Hawker opens restaurant, spent $170K on new outlet. 8days. https://www.8days.sg/eatanddrink/newsandreviews/vivian-lai-lookalike-nasi-lemak-hawker-opens-170k-restaurant-hong-leong-building-raffles-97-nasi-lemak-820741

Traditional Indian Curry - Bing. (n.d.). Bing. https://www.bing.com/images/search?view=detailV2&ccid=NVXrSOro&id=C930B3329C6D3FCF6E3FE407F5A39C6046BDEC50&thid=OIP.NVXrSOrofUltgDT2Eq0C4QHaHa&mediaurl=https%3A%2F%2Fwww.tasteofhome.com%2Fwp-content%2Fuploads%2F2021%2F01%2Ftasty-butter-chicken-curry-dish-from-indian-cuisine-1277362334.jpg&exph=1200&expw=1200&q=Traditional+Indian+Curry&form=IRPRST&ck=20702620DDA1035297075146279A8EE0&selectedindex=42&itb=0&cw=1145&ch=601&ajaxhist=0&ajaxserp=0&vt=2&sim=11

Google Search. (n.d.). https://www.google.com/search?sca_esv=1307f981479751f5&sxsrf=ANbL-n7r8x1rH1yHpR1Un0r55svmJFPnFg:1768676954706&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOTZV4vuyJOEzu-SridVVp79szE6apQ1QRRIUbkRDVB0a_D31Co7SWQrnZlfAUnbDySRPDT65300nuVhTLXHRDYnwQxUk0Bg8nnphz_CcpNI1Y5h_Xg%3D%3D&q=Big+Daddy%27s+Chicken+%26+Noodles+Reviews&sa=X&ved=2ahUKEwjUhO6Mo5OSAxW91jgGHZ2hKX8Q0bkNegQIJBAD&biw=1272&bih=668&dpr=1.5&aic=0

western food pictures - Bing. (n.d.). Bing. https://www.bing.com/images/search?view=detailV2&ccid=I5FXpkUW&id=6DFFD9365D6954EE2A5BAD368559E44896E7F204&thid=OIP.I5FXpkUW6UDuzubZf9nEBgHaE7&mediaurl=https%3A%2F%2Fmedia.istockphoto.com%2Fid%2F1265268905%2Fphoto%2Fbarbecue-chicken-jollof-rice.webp%3Fb%3D1%26s%3D170667a%26w%3D0%26k%3D20%26c%3DxYxdTJwYQhGjTZQr1gNCAc4MntUEtQW5q1di2xRtVfo%3D&exph=339&expw=509&q=western+food+pictures&form=IRPRST&ck=E68599A9092BDDAB35028489442F351B&selectedindex=50&itb=0&cw=1145&ch=601&ajaxhist=0&ajaxserp=0&vt=2&sim=11

Hussain, W. (2020). nasi lemak set with sunny egg, rice, chicken wing, fried fish, pickle, salad, peanut and chilli sauce served in dish isolated on banana leaf top view of singapore food Pro Photo Click to view uploads for Waqar Hussain Waqar Hussain 11,267 Resources Pro License What’s This? Pro ContentWhy Pro? File Info  freestar Related Keywords. Vecteezy. https://www.vecteezy.com/photo/45479895-nasi-lemak-set-with-sunny-egg-rice-chicken-wing-fried-fish-pickle-salad-peanut-and-chilli-sauce-served-in-dish-isolated-on-banana-leaf-top-view-of-singapore-food


International Muslim Food Stall (Changi Village Hawker Centre). (2019). Food Advisor. Retrieved January 18, 2026, from https://www.foodadvisor.com.sg/restaurant/international-muslim-food-stall-changi-village-hawker-centre/


Otah-Otah. (n.d.). Satayboy. https://satayboy.sg/products/mackerel-otah

Heng, W. T. (2021, June 26). White Carrot Cake stock photo. iStock. https://www.istockphoto.com/photo/white-carrot-cake-gm1325573092-410555501

Pauline. (2018, August 21). Kway Teow Mee at the Golden Mile Food Centre. I Really Like Food. Retrieved January 18, 2026, from https://ireallylikefood.com/kway-teow-mee-golden-mile-food-centre/

Evan. (2019, February 20). 18 Best stalls at Boon Lay Place Food Village - hidden gem with plenty of mouthwatering food! - EatandTravelWithUs. Eat And Travel With Us. https://www.eatandtravelwithus.com/2019/02/boon-lay-hawker-centre-best-stalls/

Phua, R. (2022b, October 6). Hawker food makes it big in New York. The Business Times. https://www.businesstimes.com.sg/lifestyle/food-drink/hawker-food-makes-it-big-new-york

National Environment Agency. (n.d.). User guide for electronic signing of tenancy agreement (for existing stallholders). National Environment Agency. https://www.nea.gov.sg/docs/default-source/hawker-centres-documents/e-ta-user-guides/user-guide-for-electronic-signing-of-tenancy-agreement-(for-existing-stallholders).pdf

Images and assets (e.g. ShiokLah(cropped).jpeg) were generated using ChatGPT (OpenAI) for educational purposes.
