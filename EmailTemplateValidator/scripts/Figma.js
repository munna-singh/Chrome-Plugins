// var figmaPullContent = document.getElementById("btnPullContent");

// figmaPullContent.addEventListener("click", async () => {
//   var figmaFile = document.getElementById("txtFigmaFile");
//   var figmaNode = document.getElementById("txtFigmaNodeId");
//   var token = document.getElementById("txtFigmaPAT");
//   // url: `https://api.figma.com/v1/files/NOLD0VqlLthvIPKRoU3M3A/nodes?ids=511:5617`,
//   var figmaPageId = figmaFile.value;
//   var figmaNodeId = figmaNode.value;
//   var figmaUrl = `https://api.figma.com/v1/files/${figmaPageId}/nodes?ids=${figmaNodeId}`;
//   alert(`Figma Api Requested -> ${figmaUrl}`);

//   $.ajax({
//     type: "GET",
//     url: figmaUrl,
//     headers: { "X-Figma-Token": "376646-3fac65f7-6fb8-4bd6-8bb2-956ed4cc1e77" },
//     success: function (res) {
//       var nodestyles = res.nodes[figmaNodeId].styles;
//       // var filteredResult = res.nodes[figmaNodeId].document.children.filter(function (obj) {
//       //   return obj.type == "FRAME";
//       // });
//       // var childs = []
//       // filteredResult.forEach(element => {
//       //   GetChild(element, childs);
//       // });

//       // GetChild(filteredResult[0], childs);
//       var nodestyles = res.nodes[figmaNodeId].styles;
//       // var filteredResult = data.nodes[document_node_id].document.children.filter(function (obj) {
//       //     return obj.type == "FRAME";
//       // });
//       var filteredResult = res.nodes[figmaNodeId].document.children;
//       var childs = [];

//       // Get all child items and recurse through all nodes
//       GetChild(filteredResult, childs);

//       var secFilter = [];
//       var prevVal = "";
//       var justTextContent = [];

//       childs.forEach((element) => {
//         //Find text container type, h1/h2,etc

//         if (element.type === "VECTOR") {
//           var idindex = element.id.lastIndexOf(":");
//           var tid = element.id.substring(0, idindex);
//           if (prevVal !== tid) {
//             element.ctrlType - "IMG";
//             secFilter.push(element);
//             prevVal = tid;
//           }
//         } else if (element.type === "RECTANGLE") {
//           if (element.fills && element.fills.length > 0) {
//             element.fills.forEach((fill) => {
//               if (fill.type === "IMAGE") {
//                 element.type = "IMAGE";
//                 element.ctrlType - "IMG";
//               }
//             });
//           }
//           secFilter.push(element);
//         } else if (element.type === "TEXT") {
//           var ctrlType = "";
//           if (element.styles) {
//             ctrlType =
//               nodestyles[
//                 element.styles.text ? element.styles.text : element.styles.fill
//               ].name;
//           }

//           if ((element.name = "button")) {
//             ctrlType = "a";
//           }

//           element.ctrlType = ctrlType;

//           var content = element.characters.replace("\n", "");
//           justTextContent.push({
//             section_name: element.name,
//             text: content,
//             ctlType: ctrlType,
//           });

//           secFilter.push(element);
//         } else {
//           secFilter.push(element);
//         }
//       });

//       justTextContent.forEach((item) => {
//         console.info(item);
//       });
//       localStorage.setItem("FigmaNodeChars", JSON.stringify(justTextContent));
//       alert(
//         `Total content items saved in localstorage --> ${justTextContent.length}`
//       );
//       var itemsInStorage = localStorage.getItem("FigmaNodeChars");
//       console.info(itemsInStorage);
//       // const formatter = new JSONFormatter(justTextContent);
//       // // $("#pageJson").append(formatter.render());
//       // document.body.appendChild(formatter.render());
//     },
//     error: function (XMLHttpRequest, textStatus, errorThrown) {
//       alert(
//         "Unable to fullfill the request right now. Please try after some time."
//       );
//     },
//     dataType: "json",
//     async: false,
//   });
// });

// function GetChild(nodes, lists) {
//   nodes.forEach((child) => {
//     if (child.children && child.children.length > 0) {
//       GetChild(child.children, lists);
//     } else {
//       lists.push(child);
//     }
//   });
// }