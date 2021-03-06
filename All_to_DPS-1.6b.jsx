﻿/**********************************************************//*                  All to DPS Script                     *//*           Patrick van Zadel - sept 2013                *//*             RedactiePartners & Adobe                   *//**********************************************************//**********************************************************//*                       Default Values                   *//**********************************************************/var VERSION = "1.6b";// -------- Taken from Derek Lu's create_indd.jsx ------// Use decimals otherwise the multiple article import will// have rounding errors and not allow a flattened stack./*  Leave these at the default, they will only be used if no input is given in the first dialog*/var PORTRAIT_PAGE_WIDTH = 767.9999;var PORTRAIT_PAGE_HEIGHT = 1023.9999;var LANDSCAPE_PAGE_WIDTH = 1023.9999;var LANDSCAPE_PAGE_HEIGHT = 767.9999;// Defines the Aspect Ratio of a pdf for optimal scalingvar PORTRAIT_ASPECT_RATIO = PORTRAIT_PAGE_WIDTH / PORTRAIT_PAGE_HEIGHT;// Defines the Geometric bounds used for optimal document creatonvar PORTRAIT_GEOMETRIC_BOUNDS = {geometricBounds: [0, 0, PORTRAIT_PAGE_HEIGHT, PORTRAIT_PAGE_WIDTH]};var LANDSCAPE_GEOMETRIC_BOUNDS = {geometricBounds: [0, 0, LANDSCAPE_PAGE_HEIGHT, LANDSCAPE_PAGE_WIDTH / 2]};/**********************************************************//*                Interface Variables                     *//**********************************************************/var mainDialog; // The Main Dialog with all input valuesvar confirmDialog; // Confirmation Dialogvar chooseTemplate; // Var group for Template (Single, Multiple) interfacevar chooseExtension; // Var group for extension interfacevar rBox; // Var for the R input boxvar gBox;  // Var for the G input boxvar bBox; // Var for the B input boxvar widthBox; // Var for the Width input boxvar heightBox; // Var for the Height input box// Value Saving Variablesvar chosenTemplate; // Stores the value of the chosen Templatevar chosenExtension; // Stores the value of the chosen Extensionvar chosenR; // Stores the value of the chosen R value (RGB)var chosenG; // Stores the value of the chosen G value (RGB)var chosenB; // Stores the value of the chosen B value (RGB)var chosenWidth; // Stores the value of the chosen Width valuevar chosenHeight; // Stores the value of the chsoen Height valuevar fileWidth; // For Folder Savingvar fileHeight;/**********************************************************//*                  Start Script Here                     *//**********************************************************/initWindow();function initWindow() {    mainDialog = new Window("dialog","All To DPS "+VERSION, undefined); // Create the Window for the elements    mainDialog.alignChildren = "left"; // Align all future added interface elements to the left - left, center, right    /* Add Template Elements */    var templateLabel = mainDialog.add("statictext", undefined, "1. Choose a Template:"); // Adds a text label    chooseTemplate = mainDialog.add("dropdownlist", undefined, ["Single pages", "Spreads"]); // Add the dropdown list and populate with an array    chooseTemplate.selection = 0; // Default to the first value in the array    /* File Extension Elements */    var extensionLabel = mainDialog.add("statictext", undefined, "2. Choose the file Extensions:"); // Adds a text label    chooseExtension = mainDialog.add("dropdownlist", undefined, ["PDF", "jpg", "jpeg", "png"]);// Add the dropdown list and populate with an array    chooseExtension.selection = 0; // Default to the first value in the array    /* Device Resolution Elements */    var screenSizeLabel = mainDialog.add("statictext",undefined,"3. Resolution Input (Landscape):"); // Adds a text label    var screenSize = mainDialog.add("group"); // Creates a group so the the input boxes align next to eachother    var widthLabel = screenSize.add("statictext",undefined,"width:"); // Add a width text label    widthBox = screenSize.add("edittext",undefined,"1024"); // add the Width input box with a default value    var pxLabel = screenSize.add("statictext",undefined,"px"); // Add a px label    var heightLabel = screenSize.add("statictext",undefined,"height:"); // Add a height text label    heightBox = screenSize.add("edittext",undefined,"768"); // add the Height input box with a default value    var px2Label = screenSize.add("statictext",undefined,"px"); // Add a px label    widthBox.characters = heightBox.characters = 4; // Restrict the input numbers so it can't go higher then 9999 (InDesign will probably Crash anyway if you go higher)    /* Background Color Elements */    var bgcolorLabel = mainDialog.add("statictext", undefined, "4. RGB Values for background:"); // Adds a text label    var colorGroup = mainDialog.add("group"); // Creates a group so the the input boxes align next to eachother    var rLabel = colorGroup.add("statictext", undefined, "R:"); // add a R label    rBox = colorGroup.add("edittext", undefined, "255"); // Create a input box with a default value (255 for white)    var gLabel = colorGroup.add("statictext", undefined, "G:"); // add a G label    gBox = colorGroup.add("edittext", undefined, "255"); // Create a input box with a default value (255 for white)    var bLabel = colorGroup.add("statictext", undefined, "B:"); // add a B label    bBox = colorGroup.add("edittext", undefined, "255"); // Create a input box with a default value (255 for white)    rBox.characters= gBox.characters = bBox.characters = 3; // Restrict the input boxes to 3 characters only   /* Confirmation Button Elements */   var mainButtons = mainDialog.add("group"); // Create a group for the confirmation elements   mainButtons.add("button", undefined, "OK", {name:"ok"}); // Add a "OK" Button   mainButtons.add("button", undefined, "Cancel", {name:"cancel"}); // Add a Cancel button   /* Now we need to detect if OK or CANCEL was selected */   if(mainDialog.show() == 1) { // This reacts to the OK Button       /* Let's Save all the needed values to start the script */       chosenTemplate = chooseTemplate.selection.index; // Saves the index number of the chosen item in the dropdown list. either 0 or 1.       chosenExtension = chooseExtension.selection.text; // Save the text from the Extension dropdown list. either PDF, jpg, jpeg or png.       chosenR = parseInt(rBox.text); // we parse the inputted text value back to an Integer value       chosenG = parseInt(gBox.text); // we parse the inputted text value back to an Integer value       chosenB = parseInt(bBox.text); // we parse the inputted text value back to an Integer value       chosenWidth = parseInt(widthBox.text); // we parse the inputted text value back to an Integer value       chosenHeight = parseInt(heightBox.text);  // we parse the inputted text value back to an Integer value              /****************** TO DO *****************/       /*Find a better way to save inputs as integers.*/       /*******************************************/              /* Anyway now that everything is stored, Let's open up the Folder browser so we can choose the source files */       chooseFolder();          } else { // or else we probably pressed CANCEL       exit(); // We just simply exit the complete script and nothing will be done   }   /* Let's show that mainDialog */   mainDialog.show();}function chooseFolder() {    /*        Let's change those default page resolution values to the inputted values first        As mentioned above we need to use decimals to bypass rounding errors.        so we automatically deduct 0.0001 of the inputted values    */    PORTRAIT_PAGE_WIDTH = chosenHeight - 0.0001;    PORTRAIT_PAGE_HEIGHT = chosenWidth - 0.0001;    LANDSCAPE_PAGE_WIDTH = chosenWidth - 0.0001;    LANDSCAPE_PAGE_HEIGHT = chosenHeight - 0.0001;    fileWidth = chosenWidth;    fileHeight = chosenHeight;    /* Now let's chose the location of the files */    folderLocation = Folder.selectDialog("Choose the file locations");    /* if for some reason the command is not used let's handle that correctly */    if(!folderLocation)        return;        /* Set the first line for the needed sidecar.xml file for multiple import later on */    sidecarStr = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><sidecar>";        /* Now we need to verify some data if a PDF Source is used. The script can't place the PDF Docs if there is no Cropping reference */    app.pdfPlacePreferences.transparentBackground = false;    app.pdfPlacePreferences.pdfCrop = PDFCrop.CROP_TRIM;        /* Set the location of the files in a variable */    folder = new Folder([folderLocation]);        /* Here we are gonna store some data from the chosen folder */    var filename = "*."+chosenExtension; // all files in the folder that have the chosen extension    var contents = folder.getFiles(filename); // Load all these files into a variable    var len = contents.length; // get the total number of files in that folder        /* Ok, so we got all the files and the variables. Last thing to do is let the code execute the correct script for Single or Multi Pages */    if(chosenTemplate == 0) { // if Single Pages is chosen        convertToSinglePages(contents, len);    } else { // otherwise it must be Multi Pages        convertToMultiPage(contents, len);    }}/********************************************************//*                  Single Pages Script                 *//********************************************************/function convertToSinglePages(contents, length) {    /* Grab the contents and the length and put each page through a conversion script */    for (i = 0; i < length; i++) {        pdfFile = contents[i]; // Change the page accordingly        createSinglePageDoc(PageOrientation.portrait, PORTRAIT_GEOMETRIC_BOUNDS, pdfFile, folder); // Create a portrait version of the page        createSinglePageDoc(PageOrientation.landscape, LANDSCAPE_GEOMETRIC_BOUNDS, pdfFile, folder); // Create a landscape version of the page    }        sidecarStr += "</sidecar>"// in createSinglePageDoc we save and close the document, upon saving each page gets a sidecar.xml entry. so when the above code is done we need to close the XML file by adding 1 line        var file = new File(folder.toString() + "/forImportSingles"+fileWidth.toString()+"x"+fileHeight.toString()+"/sidecar.xml"); // Save the sidecar.xml in the same location as the outputted files  file.open("w"); // Open a empty file with "write" acces  file.write(sidecarStr); // input all the generated sidecar data into that empty document and write that  file.close(); // closes the sidecar.xml file        confirmDialog = new Window("dialog","Success", undefined, {closeButton:true}); // When the script end we need a confirmation alert that the script was done    confirmDialog.alignChildren = "center"; // align all elements to the center    var templateLabel = confirmDialog.add("statictext", undefined, "Conversion is done!"); // Add some text for feedback    var confirmButtons = confirmDialog.add("group"); // Create a group  for the confirm buttons    confirmButtons.add("button", undefined, "OK", {name:"ok"}); // Create an OK Button        /* Again we need to check if Ok was pressed or if the user maybe pressed the ESC key */    if(confirmDialog.show() == 1) { // OK is pressed        exit();    } else { // ESC was pressed (or anything that could've closed the dialog)        exit();    }}function createSinglePageDoc(orientation, geometricBounds, pdfFile, folder) {  var doc = createDocument(orientation); // Create a new document with the provided Orientation (Portrait or Landscape)  var page = doc.pages[0]; // Write everything on the new docs first page      var rect = page.rectangles.add(orientation == PageOrientation.portrait ? geometricBounds : {geometricBounds: [0, 0, LANDSCAPE_PAGE_HEIGHT, LANDSCAPE_PAGE_WIDTH]}); // Creates a rectangle in the background so we can add a background color    rect.fillColor = makeRGBForDoc(doc); // Grab the RGB values and set the color for the above created rectangle  var pdf = page.place(pdfFile)[0]; // Place the loaded files (the var is called pdf because it is best to use a PDF source but this can also be jpg or png)      var fileName = getFileName(pdfFile); // Gets the current documents filename  if (orientation == PageOrientation.portrait) { // if orientation is portrait...    setSinglePDFProperties(pdf); // ...we set the properties accordingly     saveAndCloseDoc(doc, folder, fileName, fileName + "_v.indd", true); // Saves all data and closes it  } else { // if orientation is landscape...    alignSinglePDF(pdf); // ...we set the properties accordingly     saveAndCloseDoc(doc, folder, fileName, fileName + "_h.indd"); // Saves all data and closes it  }}function setSinglePDFProperties(pdf) {  var visibleBounds = pdf.visibleBounds; // The visiblebounds of the placed file (The whole file size)  var width = visibleBounds[3]; // get the width of the visiblebound  var height = visibleBounds[2]; // and the height of the visiblebounds     var rect = pdf.parent; // The files parent box  if (width / height > PORTRAIT_ASPECT_RATIO) { // Black bars above and below the content.     // Use the entire width.    var scale = PORTRAIT_PAGE_WIDTH / width; // Set the scale value so we know how much we can scale it     rect.absoluteHorizontalScale = rect.absoluteVerticalScale = scale * 100;            alignPDF(rect, width * scale, height * scale, PORTRAIT_PAGE_WIDTH, PORTRAIT_PAGE_HEIGHT);   } else if (width / height < PORTRAIT_ASPECT_RATIO) { // Black bars on the left and right side    // Use the entire width.    var scale = PORTRAIT_PAGE_WIDTH / width; // Set the scale value so we know how much we can scale it    rect.absoluteHorizontalScale = rect.absoluteVerticalScale = scale * 100;         alignPDF(rect, width * scale, height * scale, PORTRAIT_PAGE_WIDTH, PORTRAIT_PAGE_HEIGHT);  } else { // Scale width and height to take up entire page.    rect.absoluteHorizontalScale = (PORTRAIT_PAGE_WIDTH / width) * 100;    rect.absoluteVerticalScale = (PORTRAIT_PAGE_HEIGHT / height) * 100;  }}function alignSinglePDF(pdf1) {    var availableWidth = LANDSCAPE_PAGE_WIDTH;    var visibleBounds = (pdf1).visibleBounds;    var width = visibleBounds[3];    var height = visibleBounds[2];            var scale = calculateScale(width, height, availableWidth, LANDSCAPE_PAGE_HEIGHT);                if (pdf1) {        pdf1.parent.absoluteHorizontalScale = pdf1.parent.absoluteVerticalScale = scale * 100;        alignPDF(pdf1.parent, width * scale, height * scale, availableWidth, LANDSCAPE_PAGE_HEIGHT, 0);    }    }/********************************************************//*                   Multi Pages Script                 *//********************************************************//*    So this is basically Derek Lu's inital script (create_indd.jsx)*/function convertToMultiPage(contents, length) {       pdfFile = contents[length - 4]; // Get the lenght minus the cover, inside cover, inside back, back       createMultiPageDoc(PageOrientation.portrait, PORTRAIT_GEOMETRIC_BOUNDS, pdfFile, folder); // Create the cover portrait version       createMultiPageDoc(PageOrientation.landscape, PORTRAIT_GEOMETRIC_BOUNDS, pdfFile, folder); // Create the  cover landscape version              length -= 4;              for (var j = 0; j < length; j++) {           if (j == 0) { // The first page after the cover.      // Combine the inside front cover (PCV0002__HRDP-120200.pdf) with the first pdf in the list (P003__HRDP-120200.pdf).      pdfFile1 = contents[length + 1]; // Inside front cover.      pdfFile2 = contents[j];    } else if (j == length - 1) { // The last page before the back cover.      // Combine the inside back cover (PCV0003__HRDP-120200.pdf) with the last pdf in the format P098__HRDP-120200.pdf.      pdfFile1 = contents[j];      pdfFile2 = contents[length + 2]; // Inside back cover    } else {      pdfFile1 = contents[j];      pdfFile2 = contents[j + 1];      j += 1;    }            createPortraitDoc(pdfFile1, pdfFile2, folder); // create all other portrait docs    createLandscapeDoc(pdfFile1, pdfFile2, folder); // create all other landscape docs  }  pdfFile = contents[contents.length - 1];  createMultiPageDoc(PageOrientation.portrait, PORTRAIT_GEOMETRIC_BOUNDS, pdfFile, folder); // Create the portrait back cover.  createMultiPageDoc(PageOrientation.landscape, LANDSCAPE_GEOMETRIC_BOUNDS, pdfFile, folder, true); // Create the landscape back cover.    sidecarStr += "</sidecar>"; // Finalise the sidecar.xml    var file = new File(folder.toString() + "/forImportMultiple"+fileWidth.toString()+"x"+fileHeight.toString()+"/sidecar.xml"); // Save the sidecar.xml in the same location as the outputted files  file.open("w"); // Open a empty file with "write" acces  file.write(sidecarStr); // input all the generated sidecar data into that empty document and write that  file.close(); // closes the sidecar.xml file        confirmDialog = new Window("dialog","Success", undefined, {closeButton:true}); // When the script end we need a confirmation alert that the script was done    confirmDialog.alignChildren = "center"; // align all elements to the center    var templateLabel = confirmDialog.add("statictext", undefined, "Conversion is done!"); // Add some text for feedback    var confirmButtons = confirmDialog.add("group"); // Create a group  for the confirm buttons    confirmButtons.add("button", undefined, "OK", {name:"ok"}); // Create an OK Button        /* Again we need to check if Ok was pressed or if the user maybe pressed the ESC key */    if(confirmDialog.show() == 1) { // OK is pressed        exit();    } else { // ESC was pressed (or anything that could've closed the dialog)        exit();    }}function createMultiPageDoc(orientation, geometricBounds, pdfFile, folder, isOffset) {  var doc = createDocument(orientation); // Create a new document with the provided Orientation (Portrait or Landscape)  var page = doc.pages[0]; // write everything on the new docs first page    var rect = page.rectangles.add(orientation == PageOrientation.portrait ? geometricBounds : {geometricBounds: [0, 0, LANDSCAPE_PAGE_HEIGHT, LANDSCAPE_PAGE_WIDTH]}); // Creates a rectangle in the background so we can add a background color  rect.fillColor = makeRGBForDoc(doc); // set the color of the above created rectangle  var pdf = page.place(pdfFile)[0]; // Grab the needed loaded file    var fileName = getFileName(pdfFile); // Grab the loaded files filename  if (orientation == PageOrientation.portrait) { //if orientation is portrait...    setSinglePDFProperties(pdf); // ...we align it accordingly    saveAndCloseDoc(doc, folder, fileName, fileName + "_v.indd", true); // Save and closes the doc  } else { // if orientation is landscape...    if (isOffset) // there is an offset to make sure the back cover get's placed correctly in Landscape      alignDoublePDFs(null, pdf); // Align the back cover    else      alignDoublePDFs(pdf); // Align the rest accordingly          saveAndCloseDoc(doc, folder, fileName, fileName + "_h.indd"); // Save and close the docs  }}function createPortraitDoc(pdfFile1, pdfFile2, folder) {  var doc = createDocument(PageOrientation.portrait); // Create a new empty doc  var page = doc.pages[0]; // Get the first page in the doc    var rect, page; // some variables     rect = page.rectangles.add({geometricBounds: [0, 0, LANDSCAPE_PAGE_WIDTH, LANDSCAPE_PAGE_HEIGHT]}); // Set the bounds for the first files background in portrait  rect.fillColor = makeRGBForDoc(doc); // Set the background color for this page      pdf = page.place(pdfFile1)[0]; // Place the first loaded file  setSinglePDFProperties(pdf); // Set some properties for this file    page = doc.pages.add(); // Create a new page.    rect = page.rectangles.add({geometricBounds: [0, 0, LANDSCAPE_PAGE_WIDTH, LANDSCAPE_PAGE_HEIGHT]}); // Set the bounds for the second file's background in portrait  rect.fillColor = makeRGBForDoc(doc); // set the background color for this page    pdf = page.place(pdfFile2)[0]; // Place the seond loaded file  setSinglePDFProperties(pdf); // set some properties for this file   var fileName = getFileName(pdfFile1); // Get the filename for the first placed file so we can save it into a folder with that name  saveAndCloseDoc(doc, folder, fileName, fileName + "_v.indd", true); // Save and close the doc}function createLandscapeDoc(pdfFile1, pdfFile2, folder) {  var doc = createDocument(PageOrientation.landscape); // Create a new empty doc  var page = doc.pages[0]; // Get the first page in the doc  var rect = page.rectangles.add({geometricBounds: [0, 0, LANDSCAPE_PAGE_HEIGHT, LANDSCAPE_PAGE_WIDTH]});// Set the bounds for the first files background in landscape  rect.fillColor = makeRGBForDoc(doc); // set the background color for this page    var pdf1 = page.place(pdfFile1)[0]; // Place the first file     var pdf2 = page.place(pdfFile2)[0]; // Place the second file    alignDoublePDFs(pdf1, pdf2); // Align both files next to eachother  var fileName = getFileName(pdfFile1); // Get the filename for the first placed file so we can save it into a folder with that name  saveAndCloseDoc(doc, folder, fileName, fileName + "_h.indd"); // Save and close the doc}function alignDoublePDFs(pdf1, pdf2) {  var availableWidth = LANDSCAPE_PAGE_WIDTH / 2; // Look for the available width on the page (depends on screen resolution and loaded files size)  var visibleBounds = (pdf1 || pdf2).visibleBounds; // Again get the full bounds of the loaded files  var width = visibleBounds[3]; // get the width of the loaded files  var height = visibleBounds[2]; // get the height of the loaded files      var scale = calculateScale(width, height, availableWidth, LANDSCAPE_PAGE_HEIGHT); // Calculate the scale of the loaded file  // Offsets used to align the page either to the left edge or the middle.  var offsetXPDF1 = 0;  var offsetXPDF2 = 0;  if (pdf1 && pdf2) {    offsetXPDF2 = availableWidth; // Offset the 2nd PDF so it is against the right edge of the 1st PDF.  } else if (pdf1 && !pdf2) { // Front cover. Position it so the x coord is the middle of the doc. Waiting for confirmation from Steve.    offsetXPDF1 = availableWidth;  }  // Align the PDF if only the first pdf is on the page (Cover)  if (pdf1 && !pdf2) {    pdf1.parent.absoluteHorizontalScale = pdf1.parent.absoluteVerticalScale = scale * 100;    alignMultiplePDF(pdf1.parent, width * scale, height * scale, availableWidth, LANDSCAPE_PAGE_HEIGHT, offsetXPDF1);  }   //Align the PDF if only the second pdf is on the page (Back Cover)  if (!pdf1 && pdf2) {    pdf2.parent.absoluteHorizontalScale = pdf2.parent.absoluteVerticalScale = scale * 100;    alignMultiplePDF(pdf2.parent, width * scale, height * scale, availableWidth, LANDSCAPE_PAGE_HEIGHT, offsetXPDF2);  }  // Align both PDF's on the page if it's a spread  if (pdf1 && pdf2) {    //Scale and Align PDF1    var scalePercent = pdf1.parent.absoluteHorizontalScale = pdf1.parent.absoluteVerticalScale = scale * 100;    var scaleNr = scalePercent / 100; // Divide the Scalepercentage for calculational purposes    var size = width * scaleNr; // get the new width of the placed pdf based on calculations    var difference = availableWidth - size; // Calculate the difference between beginning and half the page and the width of the pdf    offsetXPDF1 = difference; // Set the difference as the offset needed the place pdf1 against the edge of pdf2    alignMultiplePDF(pdf1.parent, width * scale, height * scale, availableWidth, LANDSCAPE_PAGE_HEIGHT, offsetXPDF1); // align the pdf according to the data    //Scale and Align PDF2    pdf2.parent.absoluteHorizontalScale = pdf2.parent.absoluteVerticalScale = scale * 100;    alignMultiplePDF(pdf2.parent, width * scale, height * scale, availableWidth, LANDSCAPE_PAGE_HEIGHT, offsetXPDF2);  }}/********************************************//*             Document Creation Scripts             *//********************************************/function createDocument(orientation) {    var doc = app.documents.add(false); // simply create a new document  doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.pixels; // Set the documents measure unit to pixels  doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.pixels; // Set the documents measure unit to pixels  doc.documentPreferences.pageWidth = PORTRAIT_PAGE_WIDTH + "px";  // Set the page width  doc.documentPreferences.pageHeight = PORTRAIT_PAGE_HEIGHT + "px"; // Set the page height  doc.documentPreferences.pageOrientation = orientation; // set the page orientation  doc.documentPreferences.intent = DocumentIntentOptions.WEB_INTENT; // set the intent for web (it's for digital purpose not print)  doc.documentPreferences.facingPages = false; // This makes sure there are no facing pages, just a single stand alone page    return doc; // Return the doc data back into the script}function saveAndCloseDoc(doc, folder, fileName, file, isCreateSidecar) {    /* so to make sure a user can create both Single and Multi Page without overwriting stuff we save each to seperate folders */    if(chosenTemplate == 0) { // Single Pages      var targetFolder = new Folder(folder.toString() + "/forImportSingles"+fileWidth.toString()+"x"+fileHeight.toString()+"/" + fileName);    } else { // Multi Pages        var targetFolder = new Folder(folder.toString() + "/forImportMultiple"+fileWidth.toString()+"x"+fileHeight.toString()+"/" + fileName);     }  /* if the targetfolder does not exist, create it */    if (!targetFolder.exits)    targetFolder.create();      doc.save(new File(targetFolder.toString() + "/" + file)); // Save the document to the created folder  doc.close(); // Close the new document    /* Sidecar entries cover both orientations a parameter is passed to only create them for one orientation.         Each page needs a sidecar entry    */  if (isCreateSidecar) {    sidecarStr += "<entry>";    sidecarStr += "<folderName>" + fileName +"</folderName>";    sidecarStr += "<articleTitle></articleTitle>";    sidecarStr += "<byline></byline>";    sidecarStr += "<author></author>";    sidecarStr += "<kicker></kicker>";    sidecarStr += "<description></description>";    sidecarStr += "<tags></tags>";    sidecarStr += "<isAd>false</isAd>";    sidecarStr += "<smoothScrolling>never</smoothScrolling>";    sidecarStr += "<isFlattenedStack>true</isFlattenedStack>";    sidecarStr += "</entry>";  }}/* Removes the path and file extension to return the file name. */function getFileName(value) {  var path = value.toString();  var lastIndex = path.lastIndexOf("/");  var file = path.slice(lastIndex + 1);  var lastIndexPeriod = file.lastIndexOf(".");  return file.slice(0, lastIndexPeriod);}/********************************************//*                       Misc Scripts                     *//*******************************************/function calculateScale(width, height, targetWidth, targetHeight) {  return width / height > targetWidth / targetHeight ? targetWidth / width : targetHeight / height;}function alignPDF(rect, width, height, targetWidth, targetHeight, xOffset) {  if (!xOffset)    xOffset = 0;    if (width / height > targetWidth / targetHeight) {    rect.move([xOffset, Math.round((targetHeight - height) / 2)]); // Center vertically  } else {    rect.move([Math.round((targetWidth - width) / 2), xOffset]); // Center horizontally.  }}function alignMultiplePDF(rect, width, height, targetWidth, targetHeight, xOffset) {  if (!xOffset)    xOffset = 0;    if (width / height > targetWidth / targetHeight) {    rect.move([xOffset, Math.round((targetHeight - height) / 2)]); // Center vertically  } else {    rect.move([xOffset, 0]); // Center horizontally.  }}/********************************************//*                  Color Block  Script                 *//*******************************************/function makeRGBForDoc(doc) {  var color = doc.colors.item("color"); // Creates an color variable of value color  if (!color.isValid)    color = doc.colors.add({name: "color"});    color.properties = {space: ColorSpace.RGB, model: ColorModel.process, colorValue: [chosenR, chosenG, chosenB]}; // Add the inputted RGB Values to the color      return color; // Returns the RGB Value for the color back into the script}