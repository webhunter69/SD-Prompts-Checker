chrome.runtime.onMessage.addListener((message) => {
  if (message.command === "check_png_chunk_data") {
    processFile(message.url);
  }
});

async function processFile(url) {
  try {
    const response = await fetch("https://corsproxy.io/?" + url);
    const arrayBuffer = await response.arrayBuffer();
    const byteArray = new Uint8Array(arrayBuffer);

    let offset = 8;
    let keywords = "";
    let text = "";
    let width,
      height,
      bitDepth,
      colorType,
      compressionMethod,
      filterMethod,
      interlaceMethod;
    while (offset < byteArray.length) {
      const chunkLength =
        (byteArray[offset] << 24) |
        (byteArray[offset + 1] << 16) |
        (byteArray[offset + 2] << 8) |
        byteArray[offset + 3];
      offset += 4;
      const chunkType = String.fromCharCode(
        ...byteArray.slice(offset, offset + 4)
      );
      offset += 4;
      if (chunkType === "tEXt") {
        const keyword = String.fromCharCode(
          ...byteArray.slice(offset, offset + chunkLength)
        );
        const keywordData = keyword.split("\0");
        keywords += keywordData[0] + "; ";
        text += keywordData[1] + "; ";
      } else if (chunkType === "zTXt") {
        const keyword = String.fromCharCode(
          ...byteArray.slice(offset, offset + chunkLength)
        );
        const keywordData = keyword.split("\0");
        const compression = byteArray[offset + keywordData[0].length + 1];
        keywords += keywordData[0] + "; ";
        if (compression === 0) {
          text += keywordData[2] + "; ";
        } else {
        }
      } else if (chunkType === "iTXt") {
        const keyword = String.fromCharCode(
          ...byteArray.slice(offset, offset + chunkLength)
        );
        const keywordData = keyword.split("\0");
        keywords += keywordData[0] + "; ";
        if (keywordData[1] === "") {
          text += keywordData[3] + "; ";
        } else {
        }
      } else if (chunkType === "IHDR") {
        width =
          (byteArray[offset] << 24) |
          (byteArray[offset + 1] << 16) |
          (byteArray[offset + 2] << 8) |
          byteArray[offset + 3];
        height =
          (byteArray[offset + 4] << 24) |
          (byteArray[offset + 5] << 16) |
          (byteArray[offset + 6] << 8) |
          byteArray[offset + 7];
        bitDepth = byteArray[offset + 8];
        colorType = byteArray[offset + 9];
        compressionMethod = byteArray[offset + 12];
        filterMethod = byteArray[offset + 13];
        interlaceMethod = byteArray[offset + 14];
      }
      offset += chunkLength + 4; // Skip the data and the CRC
    }
    console.log("Keywords: " + keywords);
    console.log("Text: " + text);
    console.log("Image Width: " + width);
    console.log("Image Height: " + height);
    console.log("Image Bit Depth: " + bitDepth);
    console.log("Image Color Type: " + colorType);
    console.log("Image Compression Method: " + compressionMethod);
    console.log("Image Filter Method: " + filterMethod);
    console.log("Image Interlace Method: " + interlaceMethod);
    document.body.innerHTML += `
<div id="container-stablediffusion">
 <h1>SD Prompts Checker<sup> by Hunter69.com</sup></h1>
 
</div>
`;
    document.getElementById("container-stablediffusion").innerHTML +=
      "<br>" +
      "Prompt: " +
      text +
      "<br><br>" +
      "Image Width: " +
      width +
      " px" +
      "<br>" +
      "Image Height: " +
      height +
      " px";
  } catch (error) {
    console.log(error);
  }
}
