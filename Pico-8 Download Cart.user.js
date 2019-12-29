// ==UserScript==
// @name         Pico-8 Download Cart
// @namespace    https://odd.codes
// @version      0.1
// @description  Downloads cart images from the lexaloffle BBS.
// @author       iivii
// @include      https://www.lexaloffle.com/*
// ==/UserScript==
(function() {
    var count = 1;
    if (count == 1) {
        //'use strict';
        console.log("Reading the PICO-8 News...");
        // Checks that page title is 'BBS'
        //var page = window.location.pathname.split('/')[1];
        //if (page == "BBS") {


        // Call the function to store the cart number.
        var cart_number_hash = getCartNum();
        //var cart_number_hash = cart_number;
        var cart_name = cart_number_hash.substring(1, cart_number_hash.length);
        // Output for debugs.
        console.log(cart_number_hash);
        console.log(cart_name);
        // The target links for the cart/
        var link_front = "https://www.lexaloffle.com/bbs/cposts/";
        var link_end = ".p8.png";
        // If the first char in the string is a number, get the first number from the string.
        // If the first char in the string is a letter, get the first 2 strings.
        var cart_chars;
        var first_char = cart_name[0];
        console.log(first_char);
        var nums = ['0','1','2','3','4','5','6','7','8','9'];
        var isnum;
        // Loop through numbers to see if it's a number
        for (var i = 0; i < nums.length; i++) {
            if (first_char == nums[i]) {
                isnum = true;
                console.log("The first char is a number!");
                break;
            }
            else {
                isnum = false;
            }
        }
        //
        // Check if the loop has found the first number to be a number or string, as this
        // for some reason changes the destintation of the p8.png file. If the cart begins
        // with a letter, like a custom named cart does, the first slash is followed by the
        // first 2 letters of the carts name. If the cart is just numbered, then the first
        // slash is followed by the first number of the cart itself.
        if (isnum == false) {
            cart_chars = cart_name[0] + cart_name[1];
        } else {
            cart_chars = cart_name[0];
        }
        //
        // Combine the properly obtained characters with the rest of the link text.
        var link_mid = cart_chars + "/" + cart_name;
        // Combine all 3 to make the link.
        var cart_download_link = link_front + link_mid + link_end;
        // Create the Download Link!
        cartDownload(cart_name, cart_download_link);

        return;
    } else {
        count+=1;
        return;
    }


})();


// Grab cart title (and only title) from the element
function getCartNum(){
    var cart_context = document.getElementById("main_div").innerText;
    // The cart is always preceeded by a pound sign, and it's always the first character of its type inside
    // the innerHTML so this is the starting index.
    var cart_num_index_start = cart_context.indexOf("#");
    // The string we're looking for starts with #, but the nearest character that falls after it ends
    // is a '|', which should always be preceeeded by a space character. So, if we subtract 1 from
    // the value that the indexOf method returns, we should have the 2 numbers we need to get the cart
    // number by using the substring method.
    var cart_num_index_end = cart_context.indexOf("|") - 1;
    // Now, store the string found in between these 2 indexes and it should be the cart number.
    var cart_number = cart_context.substring(cart_num_index_start, cart_num_index_end);
    return cart_number;

}

// Create the cart download link beneath the play field.
function cartDownload(cart_name, cart_download_link){
    var link_end = ".p8.png";
    var newLink = document.createElement('a');
    var linkText = document.createTextNode('Download Cart!');
    newLink.appendChild(linkText);
    newLink.setAttribute('href',cart_download_link);
    newLink.setAttribute('download',cart_name+link_end);
    newLink.setAttribute('style','color:#0ab7fc;font-style:bold;font-size:24;content-align:center;');
    var append_at = document.getElementById('cart_player_'+cart_name);
    append_at.parentNode.parentNode.appendChild(newLink);
}
