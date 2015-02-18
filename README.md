Camelot Unchained UI
====================

This repository contains a Visual Studio solution with the TypeScript, CSS, and image files for all of the UI widgets in Camelot Unchained. This is the entire front-end UI for the game, not a partial stripped-down version. This is what we're going to ship and we will take pull requests from the community seriously.

Licensing
---------

The code is licensed under the Mozilla Public License, version 2.0:

&nbsp;&nbsp;&nbsp;&nbsp;[https://www.mozilla.org/MPL/2.0/](https://www.mozilla.org/MPL/2.0/)

TypeScript
----------

We're using TypeScript for a lot of our UI code. It's an extension of JavaScript that includes type annotations to catch common usage errors before they break in unexpected ways. You can read more about it at:

&nbsp;&nbsp;&nbsp;&nbsp;[http://www.typescriptlang.org/](http://www.typescriptlang.org/)

Visual Studio 2013 Express for Web
----------------------------------

For convenience, there's a Visual Studio 2013 project that pulls together all the pieces. This can be opened and built in Visual Studio 2013 Express for Web, which is completely free. You can download it at:

&nbsp;&nbsp;&nbsp;&nbsp;[http://www.microsoft.com/en-us/download/details.aspx?id=40747](http://www.microsoft.com/en-us/download/details.aspx?id=40747)

&nbsp;&nbsp;&nbsp;&nbsp;**Visual Studio Update 2 (Typescript Support)**

&nbsp;&nbsp;&nbsp;&nbsp;[http://www.microsoft.com/en-us/download/details.aspx?id=42666](http://www.microsoft.com/en-us/download/details.aspx?id=42666)


Modifying your UI
-----------------

Running the game with your UI changes is still a little complicated. Right now the only way to do this is to replace the entire UI with your development version. A system to override only specific parts in a redistributable plugin is in the plans.

1. Open the UI.sln in Visual Studio, and do a Build to make sure all your TypeScript files are compiled into JavaScript.

    - To test things, try opening login.ts in Visual Studio and make some simple change like altering the text in createServersModal() from "Choose your server" to "Pick your server". 

2. Launch the Camelot Unchained patcher and get any version of the client installed and ready. This requires that you already be a backer with a tier that has access to the game.

3. Hold down the **ALT** key and click on the big green "Play Now" button. A box will pop up to enter parameters.

4. In the box, enter 'uifilepath=' and then the full path to the directory where you have the UI.sln file. For example:

    - uifilepath=C:\Users\ameggs\p4\MMO\Client\UI\

        - The trailing slash is **REQUIRED**. Spaces are **NOT PERMITTED**. The patcher will not remember your settings, so you'll have to **DO THIS EVERY TIME**. Sorry; we'll fix this soon.

5. Click OK, and the game will run with its UI loaded out of the path specified. You should see any changes you made in step 1.

UI Discussions
--------------

For discussion with your fellow intrepid modders and hackers, hang out in our backer forums at:

&nbsp;&nbsp;&nbsp;&nbsp;[http://citystate.vanillaforums.com/categories/ui-modding-hacking](http://citystate.vanillaforums.com/categories/ui-modding-hacking)
