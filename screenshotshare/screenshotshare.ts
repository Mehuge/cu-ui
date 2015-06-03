/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
module ScreenshotShare {
    var $fbShareButton = $('#btn-facebook');
    var fbFrame: any = document.getElementById('fb-frame');
    var twitterFrame: any = document.getElementById('twitter-frame');
    var imageData;
    var img: any = document.getElementById('screenshot-image');
    var isLoaded = false;
    var $btnClose = $('.window-close');
    var $twitterShareButton = $('#btn-twitter');
    $twitterShareButton.prop('disabled', true);
    var statusMessage = document.getElementById('status-message');

    function hideScreenshotShare(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        cuAPI.ReleaseInputOwnership();

        $('.window').fadeOut(() => {
            if (typeof cuAPI === 'object') {
                cuAPI.HideUI('screenshotshare');
                setTimeout(() => {
                    $('.window').css({ display: 'block' });
                }, 100);
            }
        });

        return false;
    }

    var $btnTwitterLogin = $('#btn-twitter-login');

    $btnTwitterLogin.click(function () {
        twitterFrame.contentWindow.postMessage("Signin", 'http://camelotunchained.com');
    });

    $btnClose.click(hideScreenshotShare);

    $twitterShareButton.click(() => {
        if (isLoaded) {
            var canvas: any = document.createElement('canvas');
            canvas.width = 1080;
            canvas.height = 675;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            var dataUrl = canvas.toDataURL('image/png');
            twitterFrame.contentWindow.postMessage({ image: dataUrl, message: $('#user-text').val() }, 'http://camelotunchained.com');
            $twitterShareButton.prop('disabled', true);
        }
    });

    $fbShareButton.click(() => {
        // access the raw image data
        if (isLoaded) {
            var canvas: any = document.createElement('canvas');
            canvas.width = 1080;
            canvas.height = 675;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            var dataUrl = canvas.toDataURL('image/png');
            fbFrame.contentWindow.postMessage({ image: dataUrl, message: $('#user-text').val() }, 'http://camelotunchained.com');
            $fbShareButton.prop('disabled', true);
        }
    });

    cuAPI.OnInitialized(() => {
        cu.TakeScreenshot();
        // We can't detect whether or not the iframe has focus,
        // so we can't request input ownership only if the text box is chosen
        // so for now, we'll just request input as long as the window's open.
        cuAPI.RequestInputOwnership();
    });

    cu.Listen('HandleReceiveScreenShot', screenShotString => {
        isLoaded = false;
        imageData = screenShotString;
        img.setAttribute('src', "data:image/png;base64," + imageData);
        img.onload = function () {
            isLoaded = true;
        }
    });

    function enablePost(evt) {
        var target = evt.data;
        if (target === "Twitter") {
            console.log("Twitter Login Successful!");
            $twitterShareButton.prop('disabled', false);
            $btnTwitterLogin.css('display', 'none');
        } else if (target === "Facebook") {
            console.log("Facebook Login Successful!");
            $fbShareButton.prop('disabled', false);
        } else if (target === "Success") {
            console.log("Post successful!");
            statusMessage.innerText = "Post successful!";
            setTimeout(function () {
                statusMessage.innerText = "";
            }, 5000);
            $fbShareButton.prop('disabled', false);
            $twitterShareButton.prop('disabled', false);
        } else if (target === "Failure") {
            console.log("Post failed.");
            statusMessage.innerText = "Post failed.";
            setTimeout(function () {
                statusMessage.innerText = "";
            }, 5000);
            $fbShareButton.prop('disabled', false);
            $twitterShareButton.prop('disabled', false);
        }
    }

    if (window.addEventListener) {
        // For standards-compliant web browsers
        window.addEventListener("message", enablePost, false);
    }
    else {
        window.attachEvent("onmessage", enablePost);
    }
}