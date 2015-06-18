Camelot Unchained UI
====================

This repository contains a Visual Studio solution with the TypeScript, CSS, and image files for all of the UI widgets in [Camelot Unchained](http://camelotunchained.com/v2/). This is the entire front-end UI for the game, not a partial stripped-down version. This is what we're going to ship and we will take pull requests from the community seriously.


===


TypeScript
----------

We're using TypeScript for a lot of our UI code. It's an extension of JavaScript that includes type annotations to catch common usage errors before they break in unexpected ways. You can read more about it at:

> http://www.typescriptlang.org/


===


Chromium Embedded Framework Version
-----------------------------------

CEF Version: 3  - revision 1749

Chrome Version: 35.0 - build 1916 - patch 138

===


Visual Studio 2013 Express for Web
----------------------------------

For convenience, there's a Visual Studio 2013 project that pulls together all the pieces. This can be opened and built in Visual Studio 2013 Express for Web, which is completely free. You can download it via the following links:

> [Visual Studio Express 2013 for Web with Update 4](http://www.microsoft.com/en-us/download/details.aspx?id=44912)

> [Visual Studio 2013 Update 4 *(If you already have VS)*](http://www.microsoft.com/en-us/download/details.aspx?id=44921)


===


Modifying your UI
-----------------

Running the game with your UI changes is still a little complicated. Right now the only way to do this is to replace the entire UI with your development version. A system to override only specific parts in a redistributable plugin is in the plans.


##### Building the UI

Open the `UI.sln` in Visual Studio, and do a Build to make sure all your TypeScript files are compiled into JavaScript.

> *Alternatively you can use [Grunt](http://gruntjs.com/) to build the UI if you do not wish to use Visual Studio*

To test things, try opening `login.ts` and make some simple change like altering the text in `createServersModal()` from `"Choose your server"` to `"Pick your server"` and then do a Build again.


##### Launching the Game with Custom UI

Launch the Camelot Unchained patcher and get any version of the client installed and ready. This requires that you already be a backer with a tier that has access to the game.

Hold down the <kbd>Alt</kbd> key and click on the big green `Play Now` button. A box will pop up to enter parameters.

In the box, enter `uifilepath=` and then the full path to the directory where you have the `UI.sln` file. For example:

`uifilepath=C:\Users\ameggs\p4\MMO\Client\UI\`

> NOTE: The trailing slash is **REQUIRED**. Spaces are **NOT PERMITTED**. The patcher will not remember your settings, so you'll have to **DO THIS EVERY TIME**. Sorry; we'll fix this soon.

Click OK, and the game will run with its UI loaded out of the path specified. You should now see any changes you made when you built the UI.

##### Debugging the UI

To debug the UI you can open [http://localhost:8088](http://localhost:8088) when the game is running. This will allow you to use Chrome DevTools for each of the UI components.


===


UI Discussions
--------------

For discussion with your fellow intrepid modders and hackers, hang out in our backer forums at:

> https://forums.camelotunchained.com/forum/63-ui-modding-hacking/


===


Licensing
---------

The code is licensed under the Mozilla Public License, version 2.0:

> https://www.mozilla.org/MPL/2.0/
