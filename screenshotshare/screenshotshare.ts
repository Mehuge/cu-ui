/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
module ScreenshotShare {
    var $fbShareButton = $('#btn-facebook');
    var fbFrame: any = document.getElementById('fb-frame');
    var imageData;
    var img: any = document.getElementById('screenshot-image');
    var isLoaded = false;
    var $btnClose = $('.window-close');
    var $btnTwitter = $('#btn-twitter');
    $btnTwitter.prop('disabled', true);
    

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

    $btnClose.click(hideScreenshotShare);

    

    $fbShareButton.click(() => {
        // access the raw image data
        if (isLoaded) {
            var canvas: any = document.createElement('canvas');
            canvas.width = 1080;
            canvas.height = 675;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            var dataUrl = canvas.toDataURL('image/png');
            fbFrame.contentWindow.postMessage(dataUrl, 'http://camelotunchained.com');
            $fbShareButton.prop('disabled', true);
            setTimeout(() => {
                $fbShareButton.prop('disabled', false);
            }, 10000);
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
}