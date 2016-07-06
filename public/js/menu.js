'use strict';

(function() {

    var menuButton = document.getElementById('menu-button');
    if (menuButton) {
        handleMenu();
    }
    function handleMenu() {
        menuButton.addEventListener('click', function(e) {
            var menu = document.getElementById('menu-body');
            console.log("menu: ", menu);
            if (!menu) {
                showMenu(e);
            } else {
                hideMenu(menu);
            }
        });
    }

    function showMenu(e) {
        console.log("e: ", e);
        var menu = document.createElement('div');
            menu.className = "menu-body fade";
            menu.id = "menu-body";
            document.body.insertBefore(menu, document.body.children[0]);

        // menu.classList.add('fade');
        var menuInner = document.createElement('div');
           menuInner.className = "menu-inner";
        var menuTitle = document.createElement('h1');
           menuTitle.className = "menu-title";
           menuTitle.innerHTML = "Menu";
        var close = document.createElement('i');
           close.className = "fa fa-times close-menu";
           close.addEventListener('click', function(){
               hideMenu(menu);
           });
        var returnHome = document.createElement('i');
           returnHome.className = "fa fa-home go-home";
           returnHome.addEventListener('click', handleReturnHome);

        var groups = document.createElement('div');
            groups.className = "btn btn-primary btn-block btn-lg";
            groups.innerHTML = "My Groups";
            groups.addEventListener('click', handleToGroups);

        var newGroup = document.createElement('div');
            newGroup.className = "btn btn-primary btn-block btn-lg";
            newGroup.innerHTML = "Create A Group";
            newGroup.addEventListener('click', handleNewGroup);

        var logout = document.createElement('div');
            logout.className = "btn btn-danger btn-block";
            logout.innerHTML = "Logout";
            logout.addEventListener('click', handleLogout);


        menuInner.appendChild(returnHome);
        menuInner.appendChild(close);
        menuInner.appendChild(menuTitle);

        menuInner.appendChild(groups);
        menuInner.appendChild(newGroup);

        menuInner.appendChild(logout);

        menu.appendChild(menuInner);

        setTimeout(function() {
            menu.classList.remove('fade');
            menu.classList.add('open');
        }, 10);
    }

    function hideMenu(menu) {
        var menu = document.getElementById('menu-body');
        menu.classList.remove('open');
        menu.classList.add('fade');
        setTimeout(function() {
           document.body.removeChild(menu);
        }, 350);
    }

    function handleReturnHome() {
        window.location.assign('/home');
    }
    function handleLogout() {
        window.location.assign('/auth/logout');
    }
    function handleToGroups() {
        window.location.assign('/home');
    }
    function handleNewGroup() {
        window.location.assign('/home/group/new');
    }


})();
