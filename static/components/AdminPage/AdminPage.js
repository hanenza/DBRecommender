//23/4
angular.module('myApp.AdminPage', ['ngRoute'])

  .config([
    '$routeProvider', function ($routeProvider) {
      $routeProvider.when('/AdminPage', {
        templateUrl: 'components/AdminPage/AdminPage.html',
        controller: 'AdminPageController'
      });
    }])

  .controller("AdminPageController", ["$scope", "$document", "service", "$http", "$window", "$rootScope", "$location", function ($scope, $document,
    service, $http, $window, $rootScope, $location) {
    self = $scope;



    $("#userTable td").click(function () {
      //  $(this).addClass('selected').siblings().removeClass('selected');    
      alert($(this).html());
    });

    self.users = function () {
      self.updateLayout(0);
      $http.post('/getUsersInfo', { "Email": service.Email, "Password": service.Password }).then(function (response) {
        $scope.dbTable = response.data;
        self.usresArray = response.data;
      }, function (errResponse) {

        console.log(errResponse);
      });
    }

    self.deleteUser = function (email) {
      $http.post('/deleteUser', { "Email": service.Email, "Password": service.Password, "UserEmail": email }).then(function (response) {
        $scope.dbTable = response.data;
        self.users();
      }, function (errResponse) {
        console.log(errResponse);
      });
    }

    self.dbProfiles = function () {
      self.updateLayout(2);
      $http.post('/getDBProfiles', { "Email": service.Email, "Password": service.Password }).then(function (response) {
        $scope.dbTable = response.data;
      }, function (errResponse) {
        console.log(errResponse);
      });
    }


    self.castingJsonValueToNumber = function (jsonObject) {
      for (var key in jsonObject) {
        if (!isNaN(jsonObject[key])) {
          jsonObject[key] = parseFloat(jsonObject[key]);
        }
      }
      return jsonObject;
    }

    self.deleteDBProfile = function (dbName) {
      $http.post('/deleteDBProfile', { "Email": service.Email, "Password": service.Password, "dbName": dbName }).then(function (response) {
        self.dbProfiles();
      }, function (errResponse) {
        console.log(errResponse);
      });
    }

    self.addDBProfile = function () {
      if (!self.checkInputs(self.newDB)) {
        self.systemMessage = "All Inputs Is Requried";
        $('#myModal').modal('show');
        return;
      }
      // if (!self.checkSumEqualOne(self.newDB, "")) {
      //   self.systemMessage = "The Sum Of All NFR Values Should Be Equal To 1";
      //   $('#myModal').modal('show');
      //   return;
      // }
      $http.post('/addDBProfile', { "Email": service.Email, "Password": service.Password, "db": self.castingJsonValueToNumber(self.newDB) }).then(function (response) {
        if (response.data.data == "DB name Is Exist") {
          self.systemMessage = response.data.data;
          $('#myModal').modal('show');
        }
        else {
          self.dbProfiles();
          self.newDB = {};
        }
      }, function (errResponse) {
        console.log(errResponse);
      });
    }

    self.editDBProfile = function (dbName) {
      $http.post('/getDBProfileDetails', { "Email": service.Email, "Password": service.Password, "dbName": dbName }).then(function (response) {
        $scope.dbNameForEditing = dbName;
        $scope.dbValuesForEditing = response.data;
        $('#editDBProfileModal').modal('show');
      }, function (errResponse) {
        console.log(errResponse);
      });
    }

    self.updateDBValues = function () {
      $http.post('/updateDBProfile', { "Email": service.Email, "Password": service.Password, "dbProfile": $scope.dbValuesForEditing, "dbName": $scope.dbNameForEditing }).then(function (response) {
        $('#editDBProfileModal').modal('hide');
        self.dbProfiles()
      }, function (errResponse) {
        console.log(errResponse);
      });
    }

    self.checkInputs = function (jsonObject) {
      var sum = -2;
      for (var key in jsonObject) {
        sum = sum + 1;
      }
      return sum == Object.keys($scope.defaultNFR).length;
    }

    self.checkSumEqualOne = function (jsonObject, type) {
      if (type == "NFR") {
        jsonObject = self.castingJsonValueToNumber(jsonObject);
        var sum = 0;
        for (var key in jsonObject) {
          if (!isNaN(jsonObject[key].value)) {
            var value = jsonObject[key].value;
            sum = sum + parseFloat(value);
          }
        }
        return sum.toFixed(4) == 1;
      }
      jsonObject = self.castingJsonValueToNumber(jsonObject);
      var sum = 0;
      for (var key in jsonObject) {
        if (!isNaN(jsonObject[key])) {
          var value = jsonObject[key];
          sum = sum + parseFloat(value);
        }
      }
      return sum.toFixed(4) == 1;
    }

    self.projects = function (json) {
      self.updateLayout(1);
      var json = {
        UserName: service.Email
      }
      $http.post('/getAllprojects', json).then(function (response) {
        $scope.projectTable = response.data;
      }, function (errResponse) {
        console.log(errResponse);
      });
    }

    self.questions = function () {
      self.updateLayout(3);
      $http.post('/getQuestion', {}).then(function (response) {
        $scope.dbTable = response.data;
      }, function (errResponse) {
        console.log(errResponse);
      });
    }

    self.deleteQuestion = function (question) {
      $http.post('/deleteQuestion', { "Email": service.Email, "Password": service.Password, "question": question }).then(function (response) {
        self.questions();
      }, function (errResponse) {
        console.log(errResponse);
      });
    }

    self.addQuestion = function () {
      if ($scope.questionInput != "") {
        $http.post('/addQuestion', { "Email": service.Email, "Password": service.Password, "question": $scope.questionInput }).then(function (response) {
          $scope.questionInput = "";
          self.questions();
        }, function (errResponse) {
          console.log(errResponse);
        });
      }
      else {
        self.systemMessage = "Please Insert Question";
        $('#myModal').modal('show');
      }
    }

    self.defaultValues = function () {
      self.updateLayout(4);
      self.getNFRDefaultValue();
      self.getComponentDefaultValues();
    }

    self.updateLayout = function (number) {
      $scope.usersTable = true;
      $scope.Showprojects = true;
      $scope.dbPrfilesTable = true;
      $scope.questionTable = true;
      $scope.defaultValuesTable = true;
      switch (number) {
        case 0:
          $scope.usersTable = false;
          break;
        case 1:
          $scope.Showprojects = false;
          break;
        case 2:
          $scope.dbPrfilesTable = false;
          break;
        case 3:
          $scope.questionTable = false;
          break;
        case 4:
          $scope.defaultValuesTable = false;
          break;
        default:
          $scope.usersTable = false;
      }
    }

    self.getNFRDefaultValue = function () {
      $http.post('/getNFRDefaultValue').then(function (response) {
        if (response.data == null) {
          $scope.defaultNFR = {"queryComplexity":{'type': 'Constant', 'value': 0}}; 
        }
        else {
          $scope.defaultNFR = response.data;
        }
      }, function (errResponse) {
        console.log(errResponse);
      });
    }

    self.getComponentDefaultValues = function () {
      $http.post('/getComponentDefaultValues').then(function (response) {
        $scope.defaultComponent = response.data;
      }, function (errResponse) {
        console.log(errResponse);
      });
    }

    self.updateDefaultNFR = function () {
      if (self.checkSumEqualOne($scope.defaultNFR, "NFR")) {
        $http.post('/updateDefaultNFR', { "Email": service.Email, "Password": service.Password, "nfrValues": self.castingJsonValueToNumber($scope.defaultNFR) }).then(function (response) {
          self.systemMessage = response.data.data;
          $('#myModal').modal('show');
        }, function (errResponse) {
          console.log(errResponse);
        });
      }
      else {
        self.systemMessage = "The Sum Of All NFR Values Should Be Equal To 1";
        $('#myModal').modal('show');
      }
    }

    self.updateDefaultComponent = function () {
      if (self.checkSumEqualOne($scope.defaultComponent, "")) {
        $http.post('/updateDefaultComponent', { "Email": service.Email, "Password": service.Password, "componentValues": self.castingJsonValueToNumber($scope.defaultComponent) }).then(function (response) {
          self.systemMessage = response.data.data;
          $('#myModal').modal('show');
        }, function (errResponse) {
          console.log(errResponse);
        });
      }
      else {
        self.systemMessage = "The Sum Of All Component Values Should Be Equal To 1";
        $('#myModal').modal('show');
      }
    }

    self.openAddNewNfrModal = function () {
      $('#nfrModal').modal('show');
    }

    self.addNewNFR = function () {
      if ($scope.myChoise == "selectBox") {
        if ($scope.newSelect.name == null || $scope.newSelect.value == null || $scope.tmp.newNfrName == null ) {
          return;
        }
        $scope.defaultNFR[$scope.tmp.newNfrName] = { "value": 0, "type": "Select Box", "legend": $scope.choiseArray };
      }
      if ($scope.myChoise == "range") {
        if ($scope.rangeJson.minValue == null || $scope.rangeJson.maxValue == null || $scope.rangeJson.stepValue == null || $scope.tmp.newNfrName == null ) {
          return;
        }
        $scope.defaultNFR[$scope.tmp.newNfrName] = { "value": 0, "type": "Range", "max": parseFloat($scope.rangeJson.maxValue), "min": parseFloat($scope.rangeJson.minValue), "step": parseFloat($scope.rangeJson.stepValue) };
      }
      $scope.tmp.newNfrName = "";
      $http.post('/updateDefaultNFR', { "Email": service.Email, "Password": service.Password, "nfrValues": $scope.defaultNFR }).then(function (response) {
        self.systemMessage = response.data.data;
        $('#nfrModal').modal('hide');
        self.getNFRDefaultValue();
        $scope.choiseArray = {};
        $scope.rangeJson = {};
      }, function (errResponse) {
        console.log(errResponse);
      });
    }

    self.deleteNFR = function (nfrName) {
      delete $scope.defaultNFR[nfrName];
      $http.post('/updateDefaultNFR', { "Email": service.Email, "Password": service.Password, "nfrValues": self.castingJsonValueToNumber($scope.defaultNFR) }).then(function (response) {
        self.getNFRDefaultValue();
      }, function (errResponse) {
        console.log(errResponse);
      });
    }

    self.addNewSelectBoxChoise = function () {
      $scope.choiseArray[$scope.newSelect.value + " - " + $scope.newSelect.name] = parseFloat($scope.newSelect.value);
      $scope.newSelect.name = "";
      $scope.newSelect.value = "";
    }

    self.removeSelectBoxChoise = function (key) {
      delete $scope.choiseArray[key];
    }

    self.getInputInfo = function (input) {
      if(input.type=="Constant"){
        return "Constant" ;
      }
      var jsonArray = [];
      var inputJson;
      if (input.type == "Select Box") {
        inputJson = input.legend
      }
      else {
        return "Max=" + input.max + "\n" + " Min=" + input.min + "\n" + " Step=" + input.step
      }
      for (var key in input.legend) {
        var value = input.legend[key];
        jsonArray.push({ "key": key, "value": value })
      }
      jsonArray.sort(function (a, b) { return a["value"] - b["value"] });
      jsonArray.reverse();
      var returnText = "";
      for (var i = 0; i < jsonArray.length; i++) {
        returnText = returnText + " " + jsonArray[i].key + "=" + jsonArray[i].value + "\n"
      }
      return returnText.substring(1);
    }


    self.filterUser = function () {
      var input, filter, table, tr, td, i, txtValue;
      input = document.getElementById("emailInput");
      filter = input.value.toUpperCase();
      table = document.getElementById("userTable");
      tr = table.getElementsByTagName("tr");
      for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
        if (td) {
          txtValue = td.textContent || td.innerText;
          if (txtValue.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = "";
          } else {
            tr[i].style.display = "none";
          }
        }
      }
    }

    self.exportUsersData = function () {
      var i;
      for (i = 0; i < self.usresArray.length; i++) {
        obj = self.usresArray[i].questions;
        var tmpString = "";
        for (var key in obj) {
          var value = obj[key];
          tmpString = tmpString + key + ": " + value + "\n";
        }
        self.usresArray[i].questions = tmpString;
      }
      JSONToCSVConvertor(self.usresArray, "USERS_INFO", true)
    }

    function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
      var i;
      for (i = 0; i < JSONData.length; i++) {
        delete JSONData[i].$$hashKey;
      }
      //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
      var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
      var CSV = 'sep=,' + '\n';
      if (ShowLabel) {
        var row = "";
        for (var index in arrData[0]) {
          row += index + ',';
        }
        row = row.slice(0, -1);
        CSV += row + '\r\n';
      }
      for (var i = 0; i < arrData.length; i++) {
        var row = "";
        for (var index in arrData[i]) {
          row += '"' + arrData[i][index] + '",';
        }
        row.slice(0, row.length - 1);
        CSV += row + '\r\n';
      }
      if (CSV == '') {
        alert("does not work with edge");
        return;
      }

      var fileName = "MyReport_";
      fileName += ReportTitle.replace(/ /g, "_");
      var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
      var link = document.createElement("a");
      link.href = uri;
      link.style = "visibility:hidden";
      link.download = fileName + ".csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    ///add from dashboard page
    self.clearTheValues = function () {
      service.umlgraph = new joint.dia.Graph;
      service.sqlEditorList = [];
      service.NFREditorList = {};
      service.nfrDefalutValue = {};
      service.classnumber = 0;
      service.allnames = [];
      $scope.projectTable = [];
      var jsonString = JSON.stringify(service.umlgraph)
      service.jsonOfProject = {
        UmlJson: jsonString,
        SqlEditor: service.sqlEditorList,
        NfrEditor: service.NFREditorList,
        ClassNumber: service.classnumber,
        NamesInUml: service.allnames,
        NFRDefalutValue: service.nfrDefalutValue,
        ComponentDefalutValue: service.componentDefalutValue
      }
      $rootScope.ProjectName = "";
      $rootScope.projectName = true;
      $rootScope.sqlEditor = true;
      $rootScope.nfrTable = true;
      $rootScope.sqlEditor = true;
      $rootScope.umlEditor = true;
      $rootScope.matrixWeight = true;
    }

    //this function extract the jsons from the backEnd
    self.Editproject = function (project) {
      service.ProjectId = project.ProjectId;
      //complete the code here , give the uml and the sql and the nfr editor his value to return the project to the editor
      self.AssignTheValues(project.ProjectJson, project.ProjectName);
      $location.path("/UMLEditor");
    }

    //this function to give the value to the editors and open it 
    self.AssignTheValues = function (jsonOfEditors, name) {
      service.jsonOfProject.UmlJson = jsonOfEditors.UmlJson
      service.jsonOfProject.SqlEditor = jsonOfEditors.SqlEditor
      service.jsonOfProject.NfrEditor = jsonOfEditors.NfrEditor
      service.jsonOfProject.ClassNumber = jsonOfEditors.ClassNumber
      service.jsonOfProject.NamesInUml = jsonOfEditors.NamesInUml
      service.jsonOfProject.NFRDefalutValue = jsonOfEditors.NFRDefalutValue
      service.jsonOfProject.ComponentDefalutValue = jsonOfEditors.ComponentDefalutValue
      service.componentDefalutValue = jsonOfEditors.ComponentDefalutValue;
      service.nfrDefalutValue = jsonOfEditors.NFRDefalutValue;
      service.umlgraph.fromJSON(JSON.parse(jsonOfEditors.UmlJson));
      service.sqlEditorList = jsonOfEditors.SqlEditor;
      service.NFREditorList = jsonOfEditors.NfrEditor;
      service.classnumber = jsonOfEditors.ClassNumber;
      service.allnames = jsonOfEditors.NamesInUml;
      $rootScope.ProjectName = name;
      $rootScope.projectName = false;
      $rootScope.sqlEditor = false;
      $rootScope.nfrTable = false;
      $rootScope.sqlEditor = false;
      $rootScope.umlEditor = false;
      $rootScope.matrixWeight = false;
      $rootScope.matrixWeight = false;
    }

    self.showParticipants = function (projectId) {
      $('#participantsModal').modal('show');
      var i;
      for (i = 0; i < $scope.projectTable.length; i++) {
        if ($scope.projectTable[i].ProjectId == projectId) {
          $scope.participantsArray = $scope.projectTable[i].Participants;
        }
      }
    }

    //this function to delete the project from the backEnd
    self.DeleteProject = function (i) {
      json = {
        ProjectId: i.ProjectId,
        Participant: service.Email
      }
      $http.post('/DeleteProject', json).then(function (response) {
        self.projects();
      }, function (errResponse) {
        console.log(errResponse)
      });
    }

    /**
     * this function call the main function that generate the pdf file ,
     * @param {*} projectJson : the json that describe the project  
     */
    self.getAllPdfData = function (projectJson) {
      getAllPDFData(projectJson);
    }

    /**
     * this function is called number of functions that generate inforamtion for the PDF , and send the inputs to prepair pdf json 
     * @param {*} projectJson : the json the describe the project  
     */
    async function getAllPDFData(projectJson) {
      var umlTable = await getUmlTable(projectJson);
      var sqlTable = await getSQLTable(projectJson);
      var nfrTable = await getNFRTable(projectJson);
      var algorithmInput = await getAlgorithmInput(projectJson);
      var clusters = await getClusters(projectJson);
      var result = await getResult(projectJson);
      var project = await prepairJson(projectJson, umlTable, sqlTable, nfrTable, algorithmInput, clusters, result);
      await genPDF(project);
    }

    /**
     * this function is to prepair the pdf json
     * @param {the json of the project} jsonObject 
     * @param {array that describe the uml matrix} umlTable 
     * @param {array that describe the sql matrix} sqlTable 
     * @param {array that describe the nfr matrix} nfrTable 
     * @param {array that describe the final matrix} algorithmInput 
     * @param {array that describe the clusters} clusters 
     * @param {array that describe the result} result 
     */
    async function prepairJson(jsonObject, umlTable, sqlTable, nfrTable, algorithmInput, clusters, result) {
      var project = {}
      //project Introdunction
      project["projectName"] = jsonObject["ProjectName"]
      project["ProjectDescription"] = jsonObject["ProjectDescription"]
      project["ProjectOwner"] = jsonObject["ProjectOwner"]
      project["Introdunction"] = "Project Description : " + jsonObject["ProjectDescription"]

      //project setting- creating the pdf setting page informations
      var ProjectJson = jsonObject["ProjectJson"];
      var NFRDefalutValue = ProjectJson["NFRDefalutValue"];
      var nfrList = [];
      for (var key in NFRDefalutValue) {
        var value = NFRDefalutValue[key].value;
        nfrList.push([key, value]);
      }
      project["NFRValues"] = nfrList
      project["DBsProfiles"] = $scope.DBsProfilesArray;
      project["UMLTable"] = umlTable;
      project["SQLTable"] = sqlTable;
      project["NFRTable"] = nfrTable;
      project["algorithmInput"] = algorithmInput;
      project["clusters"] = clusters;
      project["result"] = result;
      return project;
    }

    /**
     * this function is resbosibe to genrage the pdf file , write to pdf creating the pdf file. 
     * @param {json that contain all information to create the file} project 
     */
    function genPDF(project) {
      // Default export is a4 paper, portrait, using milimeters for units
      var doc = new jsPDF();
      //set title in the first page
      doc.setFont("Calibri");
      doc.setFontType("bold");
      doc.setFontSize(22);
      doc.text(project["projectName"], 105, 120, null, null, "center")
      doc.text('Database Selection Report', 105, 130, null, null, "center")

      //set the footer in the first page
      doc.setFont("times");
      doc.setFontSize(18);
      doc.setFontStyle("normal");
      doc.setFontType("normal");
      doc.text("Generated by the MbDBS", 105, 270, null, null, "center");

      //second page, set the table of content
      doc.addPage();
      doc.setTextColor(51, 51, 255);
      doc.text("Table Of Content", 20, 40, null, null)
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.text("1.  Introdunction", 20, 50, null, null);
      doc.text("2.  Setting", 20, 60, null, null);
      doc.text("3.  Data Requirements", 20, 70, null, null);
      doc.text("4.  Functional Requirements", 20, 80, null, null);
      doc.text("5.  Non-Functional Requirements", 20, 90, null, null);
      doc.text("6.  Requirements Integration", 20, 100, null, null);
      doc.text("7.  The Data Clusters", 20, 110, null, null);
      doc.text("8.  Cluster Assignment", 20, 120, null, null);

      //Introdunction
      var newLines = 0;
      writeSection(doc, "1. Introdunction", "Project Name", project["projectName"], newLines, true);
      newLines = newLines + breaksCounter(project["projectName"]);
      writeSection(doc, "1. Introdunction", "Project Description", project["ProjectDescription"], newLines, false);
      newLines = newLines + breaksCounter(project["ProjectDescription"]);
      writeSection(doc, "1. Introdunction", "Project Owner", project["ProjectOwner"], newLines, false);
      newLines = newLines + breaksCounter(project["ProjectOwner"]);

      // Setting
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(51, 51, 255);
      doc.text("2. Setting", 20, 20, null, null)
      doc.autoTable(["NFR", "Weight"], project["NFRValues"], { styles: { fontSize: 9 }, startY: 30 });
      doc.autoTable(["Databases"], project["DBsProfiles"], { styles: { fontSize: 9 }, startY: 135 });


      //Data Requirements
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(51, 51, 255);
      doc.text("3. Data Requirements", 20, 20, null, null)
      doc.autoTable(project["UMLTable"][0], project["UMLTable"].slice(1), { styles: { fontSize: 2.5 }, startY: 30 });


      //Functional Requirements
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(51, 51, 255);
      doc.text("4. Functional Requirements", 20, 20, null, null)
      doc.autoTable(project["SQLTable"][0], project["SQLTable"].slice(1), { styles: { fontSize: 2.5 }, startY: 30 });

      //Non-Functional Requirements
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(51, 51, 255);
      doc.text("5. Non-Functional Requirements", 20, 20, null, null)
      doc.autoTable(project["NFRTable"][0], project["NFRTable"].slice(1), { styles: { fontSize: 2.5 }, startY: 30 });

      //Requirements Integration
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(51, 51, 255);
      doc.text("6. Requirements Integration", 20, 20, null, null)
      doc.autoTable(project["algorithmInput"][0], project["algorithmInput"].slice(1), { styles: { fontSize: 2.5 }, startY: 30 });

      //The Data Clusters
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(51, 51, 255);
      doc.text("7. The Data Clusters", 20, 20, null, null)
      doc.autoTable(["Cluster", "Classes"], project["clusters"], { styles: { fontSize: 2.5 }, startY: 30 });

      //Cluster Assignment
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(51, 51, 255);
      doc.text("8. Cluster Assignment", 20, 20, null, null)
      doc.autoTable(project["result"][0], project["result"].slice(1), { styles: { fontSize: 2.5 }, startY: 30 });

      //END
      doc.addPage();
      doc.setFontSize(40);
      doc.text('END', 105, 130, null, null, "center")

      /* The following array of object as response from the API req  */
      doc.save(project["projectName"] + '.pdf');
    }

    /**
     * this function is resposible for writing text on the pdf file
     * @param {the document object} doc 
     * @param {the title of the page} section 
     * @param {the sub title - we send when the page have more than one sections} subTitle 
     * @param {the text we want to write} content 
     * @param {the number of the \n we need adding to text to set the content in the right place} newLines 
     * @param {Tyre if we want to create new page on the pdf page} newPage 
     */
    function writeSection(doc, section, subTitle, content, newLines, newPage) {
      content = subTitle + " : " + content
      if (newPage == true) {
        doc.addPage();
      }
      doc.setFontSize(14);
      doc.setTextColor(51, 51, 255);
      if (newLines == 0) {
        doc.text(section, 20, 40, null, null)
      }
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      content = splitText(content, doc)
      doc.text(content, 20, 55 + 25 * newLines, null, null)
    }

    /**
     *  this function responible for split the string that his width is bigger than the pdf page , adding breaks
     * @param {the text we want to spilt} text 
     * @param {*the document object- pdf object} doc 
     */
    function splitText(text, doc) {
      var newText = "";
      var pdfWidth = 150;
      pointer = 0;
      if (doc.getTextWidth(text) < pdfWidth) {
        return text;
      }
      for (var i = 0; i < text.length; i++) {
        if (doc.getTextWidth(text.substring(pointer, i)) > pdfWidth) {
          if (text.charAt(i) == " " || text.charAt(i) == "," || text.charAt(i) == ".") {
            newText = newText + text.substring(pointer, i) + "\n"
            pointer = i + 1;
          }
        }
      }
      newText = newText + text.substring(pointer);
      return newText
    }

    /**
     * this function responible for count how many new line exist in the text
     * @param {*} text 
     */
    function breaksCounter(text) {
      var counter = 0;
      for (var i = 0; i < text.length; i++) {
        if (text.charAt(i) == "\n" || text.charAt(i) == "\t") {
          counter = counter + 1;
        }
      }
      return counter + 0.5;
    }

    /**
     * this function is resposibe for getting the uml matrix from the database
     * @param {the json that describe the project} project 
     */
    async function getUmlTable(project) {
      var graph = project["ProjectJson"]["UmlJson"];
      var array;
      await $http.post('/getUML', graph).then(function (response) {
        array = response.data.data;
      }, function (errResponse) {
      });
      return await arrayToMatrix(array);
    }

    /**
     * this function is resposibe for getting the nfr matrix from the database
     * @param {the json that describe the project} project 
     */
    async function getNFRTable(project) {
      var answer;
      await $http.post('/getNFR', { "tableInfo": project["ProjectJson"]["NfrEditor"], "defalutValue": project["ProjectJson"]["NFRDefalutValue"] }).then(function (response) {
        answer = response.data.data;
      }, function (errResponse) {
        console.log(errResponse);
      });
      return await (arrayToMatrix(answer))
    }

    async function getSQLTable(project) {
      var answer;
      var json = await getJosnForSQL(project);
      await $http.post('/getSQL', json).then(function (response) {
        answer = response.data.data;
      }, function (errResponse) {
        console.log(errResponse);
      });
      return await arrayToMatrix(answer);
    }

    /**
     * this function is resposibe prepair the json from the http request
     * @param {the json that describe the project} project 
     */
    function getJosnForSQL(project) {
      var answer = [];
      answer.push(project["ProjectJson"]["NamesInUml"]);
      for (i = 0; i < project["ProjectJson"]["SqlEditor"].length; i++) {
        answer.push(project["ProjectJson"]["SqlEditor"][i]);
      }
      return answer;
    }

    /**
     * this function is resposibe for getting the final matrix from the database
     * @param {the json that describe the project} project 
     */
    async function getAlgorithmInput(project) {
      var answer;
      var UMLElement = JSON.parse(project["ProjectJson"]["UmlJson"]);
      var SQLElement = await getJosnForSQL(project);
      var NFRElement = { "tableInfo": project["ProjectJson"]["NfrEditor"], "defalutValue": project["ProjectJson"]["NFRDefalutValue"] };
      var Weight = project["ProjectJson"]["ComponentDefalutValue"];
      var combineData = [];
      combineData.push(UMLElement);
      combineData.push(SQLElement);
      combineData.push(NFRElement);
      combineData.push([Weight["nfr"], Weight["sql"], Weight["nfr"]]);
      await $http.post('/getAlgorithmInput', combineData).then(function (response) {
        answer = response.data.data;
      }, function (errResponse) {
        console.log(errResponse);
      });
      return await arrayToMatrix(answer);
    }

    /**
     * this function is resposibe for getting the clusters from the database
     * @param {the json that describe the project} project 
     */
    async function getClusters(project) {
      var answer;
      var UMLElement = JSON.parse(project["ProjectJson"]["UmlJson"]);
      var SQLElement = await getJosnForSQL(project);
      var NFRElement = { "tableInfo": project["ProjectJson"]["NfrEditor"], "defalutValue": project["ProjectJson"]["NFRDefalutValue"] };
      var Weight = project["ProjectJson"]["ComponentDefalutValue"];
      var combineData = [];
      combineData.push(UMLElement);
      combineData.push(SQLElement);
      combineData.push(NFRElement);
      combineData.push([Weight["nfr"], Weight["sql"], Weight["nfr"]]);
      await $http.post('/getClusters', combineData).then(function (response) {
        answer = response;

      }, function (errResponse) {
        console.log(errResponse);
      });
      return await responseToCluster(answer);
    }

    /**
     * this function is resposibe for getting the result from the database
     * @param {the json that describe the project} project 
     */
    async function getResult(project) {
      var answer;
      var UMLElement = JSON.parse(project["ProjectJson"]["UmlJson"]);
      var SQLElement = await getJosnForSQL(project);
      var NFRElement = { "tableInfo": project["ProjectJson"]["NfrEditor"], "defalutValue": project["ProjectJson"]["NFRDefalutValue"] };
      var Weight = project["ProjectJson"]["ComponentDefalutValue"];
      var combineData = [];
      combineData.push(UMLElement);
      combineData.push(SQLElement);
      combineData.push(NFRElement);
      combineData.push([Weight["nfr"], Weight["sql"], Weight["nfr"]]);
      await $http.post('/getResult', combineData).then(function (response) {
        answer = response;
      }, function (errResponse) {
        console.log(errResponse);
      });
      return await responseToResult(answer);
    }



    /**
     * this function is resposibe for convert the array to matrix
     * @param {*} array 
     */
    function arrayToMatrix(array) {
      try {
        array[0].unshift("");
        for (var i = 1; i < array.length; i++) {
          array[i].unshift(array[0][i]);
        }
      }
      catch (err) {
        array = [["", ""], ["", ""]];
      }
      return array;
    }

    /**
    * this function is resposibe for convert the array to cluster
    * @param {the http response after call getCluster http request} response 
    */
    function responseToCluster(response) {
      try {
        var listArr = response["data"]["list"];
        answer = [];
        for (var i = 0; i < listArr.length; i++) {
          answer.push([i, listArr[i]]);
        }
        answer.push(["EPS", response["data"]["eps"]])
      }
      catch (err) {
        answer = [["", ""], ["", ""]];
      }
      return answer;
    }

    /**
    * this function is resposibe for convert the array to result
    * @param {the http response after call getResult http request} response
    */
    function responseToResult(response) {
      try {
        var clusterList = response["data"];
        if (clusterList == "") {
          return [["", ""], ["", ""]];
        }
        var answer = [];
        var row;
        var DbNames;
        for (var i = 0; i < clusterList.length; i++) {
          row = [];
          DbNames = [""];
          row.push("Cluster " + clusterList[i]["clusterName"].toString());
          var clusterInfo = clusterList[i]["clusterInfo"];
          for (var j = 0; j < clusterInfo.length; j++) {
            row.push(clusterInfo[j]["result"]);
            DbNames.push(clusterInfo[j]["dbName"]);
          }
          answer.push(row);
        }
        answer.unshift(DbNames);
      }
      catch (err) {
        answer = [["", ""], ["", ""]];
      }
      return answer;
    }

    self.getDBProfilesArray = function () {
      $http.post('/getDBProfilesPublic', {}).then(function (response) {
        $scope.DBsProfilesArray = response.data;
      }, function (errResponse) {
        console.log(errResponse);
      });
    }


    $scope.classList = service.classList;
    $scope.usersTable = true;
    $scope.questionTable = true;
    $scope.dbPrfilesTable = true;
    $scope.defaultValuesTable = true;
    $scope.Showprojects = true;
    self.systemMessage = "";
    self.usresArray;
    self.newDB = {};
    $scope.choiseArray = {};
    $scope.newSelect = {};
    $scope.defaultNFR = {"queryComplexity":{'type': 'Constant', 'value': 0}}; 
    $scope.rangeJson = {};
    $scope.myChoise = "range";
    $scope.tmp = {};
    $scope.DBsProfilesArray = [];
    self.getComponentDefaultValues();
    self.getNFRDefaultValue();
    self.clearTheValues();
    self.getNFRDefaultValue();
    self.getDBProfilesArray();
    self.projects();

  }]);


