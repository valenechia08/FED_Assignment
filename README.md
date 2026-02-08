# FED_Assignment
github fed

Account Credentials:
Patron
Username: ben_tan
Password: abcd12345

NEA Officer
Username: james_lee
Password: abcd123456

Existing features

Priscilla:
User Account Management
Feature 1 : Users can choose to log in as a patron, vendor or NEA officer, allowing each user to save personalised details such as order history for patrons for future use and bring each user to their respective pages without clashing. Messages will be shown for successful login, user not found and empty fields in username and password. -> Refer to SelectRole.html
Feature 2 : Vendors can create accounts to manage stalls, menus, and orders, patrons can also create accounts or log in as a guest to order food. Messages will be shown for successful creation of account, taken username, if password does not meet the set rule (Must be 9+ chars with letters & numbers only), if passwords typed do not match, if the username is in an invalid format (can only contain letters, numbers, dot and underscore). This helps to ensure that username and password are in the correct format and that users cannot duplicate accounts sharing the same username. It also allows users to create accounts that can store their information for future use. -> Refer to register.html
Feature 3 :  Vendors, patrons and NEA officers can reset their passwords if they forget it which includes a finding their account page, ensuring that only existing accounts can have their passwords reset. A message will be shown if the account cannot be found. -> Refer to FindAccount.html
Feature 4: A security verification page after successfully finding the account to ensure that only the respective users can log into their accounts (A code will be sent to their email but for demonstration purpose, an alert is shown instead with the random generated code). There is also a resend code button in case the user did not receive the first code. A message will be shown if the code is incorrect. This helps to verify that only the actual user can change their password and also allows for users to be able to change their password even if they faced issues in receiving the code the first few times. -> Refer to ConfirmAccount.html
Feature 5: A password reset page at the end. Messages will be shown if the passwords typed in do not match, password field is empty or the password does not meet the set rule (Must be 9+ chars with letters & numbers only). A message will also be shown if password reset was successful. This allows users to have more secure passwords and checks that they know what their password is. It also helps to inform users that their password was reset successfully and they can proceed. -> Refer to ChangePassword.html
Ordering & Checkout
Feature 1 : Patrons can view the stalls in the homepage, giving patrons a variety of cuisines and food items to choose from. -> Refer to FED_ASG.html
Feature 2 : Patrons can filter stalls based on cuisine (Note: Click on the “Chinese” picture), allowing patrons to narrow stalls down to a cuisine of their choice. To see the all the stalls again, click on the selected cuisine once more. -> Refer to FED_ASG.html
Feature 3 : Patrons can search for stalls using the search bar, allowing for easier navigation of a particular stall. -> Refer to FED_ASG.html
Feature 4 : Patrons can click on stalls and view their menus. (Note: Only “Banana Leaf Nasi Lemak” & “Boon Lay Fried Carrot Cake & Kway Teow Mee” have menu items), allowing patrons to pick which item they would like to order. (Note: You must be on FED_ASG.html and select a stall from there in order for the menus to load. If you directly open FoodStalls.html, the menus will not load). -> Menus are in FoodStalls.html (Note: FoodStalls.html back button (looks like an arrow) will only work if you were on FED_ASG.html before clicking on the food stall and being redirected to FoodStalls.html).
Feature 5 : Patrons can add items into their cart and remove them, allowing for more customisation of what items they want to order and in what quantity. -> Refer to FoodStalls.html and OrderSummary.html
Feature 6 : Patrons can checkout, choose their preferred order type (i.e. self-pickup or dine-in) -> (Refer to OrderSummary.html) and payment success or failure will be displayed. -> (Refer to PaymentSucess.html and PaymentFailed.html) This allows patrons tailor the order type to their own needs and also shows them whether their payment went through or not. (Note: The "Add a card" payment method oes not actually let you add a card and if it is selected, you will be redirected to the payment failed page. The remaining payment methods will all bring you to the payment success page.) (Note: OrderSummary back button (looks like an arrow) will only work if you were on FoodStalls.html before clicking on the cart and being redirected to OrderSummary.html).
Feature 8 : Mobile and desktop view completed for all features.
NOTE : The Javascript for all the html files except for PaymentSuccess.html(inline js) and PaymentFailed.html(inline js) are in Master_page_javascript.js

Features to implement in the future
Priscilla:
Feature 1 : Add in a description for menu items
Feature 2 : Create more menus for the other food stalls
Feature 3 : Add in more food stalls

Technologies Used
Languages used :
HTML
CSS
Javascript
JSON

Credits
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
