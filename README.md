# SMUS Calendar
###### Nathan High

### Summary
The SMUS Calendar will be a mobile app to help students keep track of schedules, events, and announcements. It is being created using Cordova (PhoneGap), a wrapper for javascript/html, so that it is easy to port to other platforms. Target platforms are iPhone, Android, and Windows Phone, although in theory porting shouldn't be very difficult to almost any platform.

### License
Tentatively, the source, where applicable, is under the MIT license.

### Building
www/index.html is the main page for the app, and it will work to some degree if you open it in Firefox or Chrome, however, it will be missing the features provided by PhoneGap and Cordova, which means it will probably break more and more as development progresses. To make it work properly, you will have to build it using Cordova, for which you can find the instructions online, , but it is easier to use Adobe's PhoneGap Build service. 

### Contributing
Please contact me at me@wizzeh.com or through Facebook if you want to help contribute. I will add you as a collaborator to the PhoneGap Build page. If you're new to git or github, but feel you can still contribute coding-wise, I would be happy to show you how to set everything up.

#### Notes on Design
* Please try to keep to Single Page Design. In other words, use AJAX for page transitions instead of direct links.
* Comment your code and keep it legible. Yes, I'm guilty of not doing this, but if other people start contributing I will have to get better about it.
* Check to see what's being worked on before starting. No use two people doing the same work.
* Try to keep everything as portable as possible. Generally, this won't be a problem unless you introduce new plugins or HTML5 features. Obviously, this only applies within the limits of reason, ie. major operating systems only.
* There's probably more and I will add it as I think of it.
* You can use pop_error(text); to debug for the moment. Please use this over console.log, even though it is annoying and slow, because I don't want to go fishing around for debug statements to remove.

### Implemented Features
* Test Layout
* Rough calendar parsing