

##Flickity
* http://flickity.metafizzy.co/

##Paypal API
* https://developer.paypal.com/docs/classic/api/apiCredentials/

##Paypal OATH Passport
* https://github.com/jaredhanson/passport-paypal-oauth

##SSL
* https://github.com/Daplie/letsencrypt-express
* https://certbot.eff.org/#osx-other



### WIRE FRAMES
-- Login
https://wireframe.cc/eMjre1

-- home
https://wireframe.cc/A55tsj

each user group will flickity to the page of bills for that group which can be clicked to get to payment page

The one exception is the user name one which will flickity over to logged in users info they can update info. Delete themselves from groups/add to groups they are admin of, etc

-- payment
https://wireframe.cc/uwatBn

each payment can flickity over to the picture of the receipt when applicable (for example bills or dinner might have picutes but rent or constant costs may not)

-- create/invite group

https://wireframe.cc/9KfjGH

if you invite users you will get a form to invite users.

I think we need more sites then I realized at first.

# Landing
Person enters our site and lands at a well formatted landing site
At this site they can
- find out about Mukipays
- go to our registration page
go to our login page

# registration
If user goes to our registration page
They should see a well formatted place to enter information
- form should use for validation to ensure info is added to our standards
- form should use https to get the info
- form should take the entered password and salt/hash it
- form should take data and store it in our database unless it is stored then tell user they exist already
(this page uses create and read aspects of crud as well as a bcrypt hashing function)

# login
Once the user is registered lets say they go to log in
They should see a well formatted login page.
- This page should allow users who are registered to log in
This page should ask for users unique email and password combo
this page should hash the password to compare it to the hashed password in our database
this page should redirect to users personal page (home page)
(This page uses read and a bcrypt comparing function)

# home
Once the user is logged into their home page. They should find a well formatted page that is unique to them. This page will load user info specific to each user. From this page they can
Go to a page to Edit their profile
Go to a group page
Go to a page to add a new group

# edit user info
If the user goes to edit their page
they should get a form that looks like the registration form that is filled in with their user info that they can update
They should also be able to delete their account from this page and remove themselves from the database.

# add new group
If the user goes to add a new group page
- they should be able to add a new group with a name
they should be able to invite users (or nonusers) to join the group

# view group
If a user goes to a group page:
-They should be able to see bills from the group
they should be able to see a specific bill

# view bill
flickidy from a specific bill to a page with just a picture of the bill
they should be able to go to the dwolla payment page
they should be able to mark as paid
# view img from bill

# Dwolla payment page:
user should be able to register for dwolla
user should be able to pay using dwolla

# header

I did not make a wireframe for this yet but it will be a hidden menu bar that can be clicked in via a hamburger button or other option.

##Colors
* color 1: R0 G117 B225
* color2: R173 G203 B225
* color3: R224 G253 B255


##Routes
* /index -> landing page
* /auth
    * /signup
    * /login
    * /logout
    * /dwolla
        * /login
* /home -> logged in middleware
    * /groups
        * /new -> new group
        * /edit -> add/delete users from group
        * /:id
            * /bills -> all bills of group :id
            * /bills/new -> add bill to group
            * /bills/:id -> single bill
                * /pay -> pay bill page at group :id, bill :id
