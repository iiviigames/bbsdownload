// ==UserScript==
// @name         Pico-8 Download Cart
// @namespace    https://github.com/iiviigames/bbsdownload
// @version      0.5
// @match        *://*.lexaloffle.com/id/*
// @match        *://www.lexaloffle.com/bbs/?cat=7/*
// @match        *://www.lexaloffle.com/bbs/*
// @author       iivii | iiviigames@pm.me | @odd_codes
// @website      https://github.com/iiviigames
// @homepageURL  https://github.com/iiviigames/bbsdownload
// @update =
// @description  Adds an auto-downloading link on BBS cartridge pages.
// ==/UserScript==

// ========================================================
//                        MAIN LOOP
// Trying out the MATCH mode instead.
// @include      https://www.lexaloffle.com/bbs/*
// ========================================================
var start = true;
var count = 0;
if (document.location.search[0] == '?' && start){main();}
// Automatically runs when on a BBS page.
function main() {

  // This container loop is an ugly attempt to force the code to run a single time.
  // It does not work well, or possibly at all.
	count++;
	if (count>1) {return;}

//if (count == 1) {

    //console.log("Reading the PICO-8 News...");
    // newGetCart();

    // Checks that page title is 'BBS'
    //var page = window.location.pathname.split('/')[1];
    //if (page == "BBS") {


    // Call the function to store the cart number.
    var cart_number_hash = getCartNum();
    if (cart_number_hash == false) {return;}
    var cart_name = cart_number_hash.substring(1, cart_number_hash.length);

    // Output for debugs.
    // console.log(cart_number_hash);
    // console.log(cart_name);




    // The target links for the cart/
    var link_front = "https://www.lexaloffle.com/bbs/cposts/";
    var link_end = ".p8.png";

    // If the first char in the string is a number, get the first number from the string.
    // If the first char in the string is a letter, get the first 2 chars in the string.
    // Create the variables needed to check these conditions.
    var cart_chars, isnum;
    var first_char = cart_name[0];
    var nums = ['0','1','2','3','4','5','6','7','8','9'];

    // Debug to see that the correct char is being read.
    // console.log(first_char);

    // Loop through the list of numerals to find out if the first char is a number.
    for (var i = 0; i < nums.length; i++) {
        if (first_char == nums[i]) {
            isnum = true;
            // Debug to make sure the loop is running.
            // console.log("The first char is a number!");
            break;
        } else { isnum = false; }
    }

    // Explanation for the particular nature of these URLs, and this strange loop.
    /* With the newest major update to the BBS, Lexaloffle gave users the ability to
    give the carts that they publish custom names. These serve as the cart's ID, which
    always must be a unique value. Prior to thsese changes, carts were all just given
    a numerical id. This new flexibility likely called for a change in some part of the
    BBS's backend, which used to subdivide carts by the first number in their ID, and
    only incremented when all the ID's in that range had been exhausted. Since carts are
    now able to contain alphabetical characters, this made the process more involoved.

    Below this are 2 examples of cartridge links, the first being an older cart that had
    an assigned number for its ID, and the second being a user-chosen ID containing both
    alphabetical and numeric characters:

    https://www.lexaloffle.com/...
    .../bbs/cposts/3/34135.p8.png                          (OLD CART)
    .../bbs/cposts/sp/spaz48_vvvvvvmoonfall_08-0.p8.png    (NEW CART)


    See the url segment immediately following 'cposts'? Notice the numerical old cart
    has a single character serving as a folder name in which the cart is stored;
    in this case a '3'.

    In opposition to this, the cart with a custom name is contained within a folder which
    has 2 characters as a title; in this case, 'sp'.

    Thus, depending on whether the cart has been given a custom identifier or not will
    alter the storage destintation of the resulting p8.png file. Althought I'm not
    certain if a cart with a custom name beginning with a numerical value would alter
    the rules I've made, I think this code would cover it either way. Here's how it goes:

    1.) Cart has no Custom Name/ID:
    - Destination URL contains THE FIRST VALUE IN THE NUMERICAL ID!

    2.) Cart has a Custom Name/ID:
    - Destination URL contains THE FIRST TWO LETTERS OF THE CART'S ID!

    */
    cart_chars = isnum == false ? cart_name[0] + cart_name[1] : cart_name[0];

    // Combine the properly obtained characters with the rest of the link text.
    var link_mid = cart_chars + "/" + cart_name;

    // Combine all 3 to make the link.
    var cart_download_link = link_front + link_mid + link_end;

    // Create the Download Link!
    cartDownload(cart_name, cart_download_link);



    // Getting Cart source infiormation tests.
    // Uses the microAjax function.
    // ie:
    // microAjax(cart_source_url, function(retdata) {var el = document.getElementById("cartsrc_" + cart_name); el.innerHTML = retdata;             OR...
    // microAjax(makeCartSourceURL(cart_name), function(retdata) { cartSourceById(cart_name, retdata)});
    // So, this is setting the innerHTML of cartsrc_whatever-cart-name to the code found inside it.
    // We need to log it out to the console

    var cart_source_url = makeCartSourceURL(cart_name);
    var cart_source_id = cartSourceById (cart_name);
    // Log these
    console.log(`Cart Source URL: https://lexaloffle.com/${cart_source_url}`);
    console.log(`Cart Source ID: ${cart_source_id}`);
    // Log the Cart Download
    console.log(`Cart Download Link: ${cart_download_link}`);


    // Not Woekoing.
    // Need print_pico8_cart_code?
    // var cart_source_test = cartSourceLog(cart_name, cart_downnload_link);
    // console.log(`Cart Source ID: ${cart_source_test}`);
    // Module.onRuntimeInitialized = _V_ => {
    //     const print_pico8_code = Module.cwrap('print_pico8_code', 'number', ['string','string']);
    //     print_pico8_code("/bbs/cposts/va/vacayvolley_1_0-1.p8.png","output");
    // };
    start = false;
    return;
}


// ========================================================
//                      FUNCTIONS
// ========================================================



// Gets the cart's source
function getCartSource(cname){
	return document.querySelector('iframe').contentDocument.activeElement.innerText
}


// Creates the cart download link just beneath the cart window.
function sourceDownload(cart_name, source){

	// var textFile = null

	var makeTextFile = function (cname, text) {
		var data = new Blob([text],{type: 'text/plain'});
		return data;
 };
  // Here, a new element is dynamically added to the BBS page. It's all very
  // self-explanatory, as the functions themselves have a intuitive nomenclature.
  var src_end = ".lua";
	makeTextFile(cart_name, source);
  // Prepare a new link element.
  var newSrc = document.createElement('button');
  // Hyperlink text to be used.
  var srcText = document.createTextNode('download source!');
  // Add the text to the initialized link.
  newSrc.appendChild(srcText);

  // Set each attribute that we need to make it functional and pretty.
  // This is the link we went through all the trouble to generate ourselves!
  newSrc.setAttribute('href',cart_download_link);

  // This attribute in particular is what gives us the auto-download functionality that I was
  // after when I started this script. I was sick of click on the cart image, going to the
  // next page, and right-click save as. It's obnoxious! This fixes it, but still leaves the
  // normal functionality!
  newSrc.setAttribute('download',cart_name+link_end);

  // Styling the text itself.
  newSrc.setAttribute('style','color:#FF77A8;font-style:bold;font-size:24;content-align:center;font-family: "PICO-8 mono;');

  // This is why we needed the cart's name separately. The BBS dynamically names elements
  // within every cart page with PHP, and thus they are never the same. This made the work
  // much harder as it uses the unique ID to name MANY, MANY parts of the css and html
  // elements needed to make any of this function.
  var append_at = getPlayWindow();
	// var append_at = document.getElementById('cart_player_'+cart_name);


  // Finally, add the motherfuckin' link to the page!
  // It's even in the PICO-8 font as long you've got it installed!
  append_at.parentNode.parentNode.appendChild(newSrc);
	return;
}

// Grab the cart ID (and ONLY the ID) from an HTML element.
function getCartNum(){

  // The goal here is to get the ID of the cartridge itself from the HTML itself...
  /*To accomplish this, the string.substring() method will be used. This means
    that a starting and ending index for the are necessary to pull it from the
    other text. I'm sure there's a better way to do this, but for now, it was the
    solution I came up with, and I explain how I did it below.*/

    // The div element containing the iframe where the cart is played or run normally
    // is the target, as it contains the ID we need. We store the text inside of a
    // variable now to parse out what we need from it later.
    var div = document.getElementById("main_div");
	if (div.innerText == null) {return;}

	var cart_context = div.innerText;

  // The cart ID is always preceeded by a pound '#' sign. This symbol is also the first of
  // its type contained within the innerHTML of the target div. This means that the '#' sign's
  // numerical position in the text is where we need to start for an index search that will
  // allow us to ONLY get the cart ID out of all the other crap in there with it.
  // Index 1 get-o!
  var cart_num_index_start = cart_context.indexOf("#");

  // You'd think it would be difficult to know what the first character following the
  // cart's ID would be in EVERY case, but immediately after every cart ID is this: ` |`.
  // The '|', IS ALWAYS THERE, preceeeded by a space character. So, if we subtract 1 from
  // the value that the indexOf method returns, for the '|' to account for that space as well,
  // we end up with the 2nd index we need for the substring method to work!
  var cart_num_index_end = cart_context.indexOf("|") - 1;

  // Now, we use the substring method to pull only the text contained within these two
  // indexes - what we're left with is the cart's ID!
  var cart_number = cart_context.substring(cart_num_index_start, cart_num_index_end);
  return cart_number;

}


// Locates the unique cart player window div.
function getPlayWindow(){
	var num = getCartNum();
	var name = num.substring(1, num.length);
	var loc = "cart_player_" + name;
	var player = document.getElementById(loc);
	// console.log(player);
	return player;
}


// Creates the cart download link just beneath the cart window.
function cartDownload(cart_name, cart_download_link){

  // Here, a new element is dynamically added to the BBS page. It's all very
  // self-explanatory, as the functions themselves have a intuitive nomenclature.
  var link_end = ".p8.png";
  // Prepare a new link element.
  var newLink = document.createElement('a');
  // Hyperlink text to be used.
  var linkText = document.createTextNode('download cart!');
  // Add the text to the initialized link.
  newLink.appendChild(linkText);

  // Set each attribute that we need to make it functional and pretty.
  // This is the link we went through all the trouble to generate ourselves!
  newLink.setAttribute('href',cart_download_link);

  // This attribute in particular is what gives us the auto-download functionality that I was
  // after when I started this script. I was sick of click on the cart image, going to the
  // next page, and right-click save as. It's obnoxious! This fixes it, but still leaves the
  // normal functionality!
  newLink.setAttribute('download',cart_name+link_end);

  // Styling the text itself.
  newLink.setAttribute('style','color:#0ab7fc;font-style:bold;font-size:24;content-align:center;font-family: "PICO-8 mono", "PICO-8 mono upper", "Pico", "Pico-8;');

  // This is why we needed the cart's name separately. The BBS dynamically names elements
  // within every cart page with PHP, and thus they are never the same. This made the work
  // much harder as it uses the unique ID to name MANY, MANY parts of the css and html
  // elements needed to make any of this function.
  var append_at = getPlayWindow();
	// var append_at = document.getElementById('cart_player_'+cart_name);


  // Finally, add the motherfuckin' link to the page!
  // It's even in the PICO-8 font as long you've got it installed!
  append_at.parentNode.parentNode.appendChild(newLink);
	return;
}



// Form the cart source code url by the cart name.
// First part of the microAJAX call.
function makeCartSourceURL(cart_name) {
    var cart_source_link_front = "/bbs/snippet.php?cart_id=";
    var cart_source_caart_name = cart_name;
    var cart_source_link_end = "&src=1"
    var cart_source_url = cart_source_link_front + cart_source_caart_name + cart_source_link_end;
    return cart_source_url;
}

// Provide the cart nammem without the leading #
// Gets the BBS ID for the cart source display div.
// Second part of the microAJAX call.
function cartSourceById (cart_name){
    var prepend = "cartsrc_";
    var append = cart_name;
    var cart_source_id = prepend + append;
    // Sets the code retrieved to be visible in the page div.
    // var cart_source_div = document.getElementById(cart_source_id);
    // // Return it for printing.
    // cart_source_div.innerHTML = retdata;
    // var r = cart_source_div.innerText;
    return cart_source_id;
    // return r;
}


function cartSourceLog(cart_name, cart_download_link) {
    var cart_source_id = cartSourceById(cart_name);
    var el = document.getElementById(cart_source_id);
    if (el.style.display == "none"){
        el.style.display = "";
        // print_cart_code("https://www.lexaloffle.com/bbs/cposts/va/vacayvolley_1_0-1.p8.png", "cartsrc_vacayvolley_1_0-1");
        // print_cart_code(cart_download_link, cart_source_id);
    } else {
        el.style.display = "none";
    //     microAjax(
    //         makeCartSourceURL(cart_name),
    //         function(retdata) {
    //             var cart_source_div = document.getElementById(cart_source_id);
    //             var csd = cart_source_div;
    //             // This is what the microAjax request gets, I think.
    //             csd.innerHTML = retdata;
    //             var cart_source_text = csd.innerText;
    //             console.log(cart_source_text);
    //             return cart_source_text;
    //         }
    //     )
    }


}
// microAjax("/bbs/snippet.php?cart_id=vacayvolley_1_0-1&src=1",
// 				function (retdata){
// 					var el = document.getElementById("cartsrc_vacayvolley_1_0-1");
// 					el.innerHTML = retdata;

// 				}
// 			);

//================================================================
