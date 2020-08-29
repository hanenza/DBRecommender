

angular.module("myApp.Dashboard", ['ngRoute'])

  .config([
    '$routeProvider', function ($routeProvider) {
      $routeProvider.when('/Dashboard', {
        templateUrl: 'components/Dashboard/Dashboard.html',
        controller: 'DashboardController'
      });
    }])

  .controller("DashboardController", ["$scope", "service", "$document", "$http", "$rootScope", "$window", "$location", "$route", function ($scope,
    service, $document, $http, $rootScope, $window, $location, $route) {
    // your code
    var self = $scope;
    self.ProjectIClicNow = {}
    //this array will save the project participants
    $scope.participantsArray = [];

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

    //this http request to get the projects when we refreshed the page
    self.getprojects = function () {
      var json = {
        UserName: service.Email
      }
      $http.post('/getprojects', json).then(function (response) {
        $scope.projectTable = response.data;
      }, function (errResponse) {
        console.log(errResponse);
      });
    }

    //this function to call the backEnd to share the project with another user
    self.shareproject = function () {
      var json = {
        NewParticipant: $scope.UserEmail,
        ProjectId: self.ProjectIClicNow.ProjectId
      }
      $http.post('/ShareProject', json).then(function (response) {
        self.getprojects();
      }, function (errResponse) {
        console.log(errResponse);
      });
      self.closeShareWindow();
    }

    //this function extract the jsons from the backEnd
    self.Editproject = function (project) {
      service.ProjectId = project.ProjectId
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
      $rootScope.projectName = false;
      $rootScope.ProjectName = name;
      $rootScope.sqlEditor = false;
      $rootScope.nfrTable = false;
      $rootScope.sqlEditor = false;
      $rootScope.umlEditor = false;
      $rootScope.matrixWeight = false;
      $rootScope.matrixWeight = false;
    }

    //this function to delete the project from the backEnd
    self.DeleteProject = function (i) {
      json = {
        ProjectId: i.ProjectId,
        Participant: service.Email
      }
      $http.post('/DeleteAllParticipants', json).then(function (response) {
        self.getprojects();
      }, function (errResponse) {
        console.log(errResponse)
      });
    }

    //this function to add new project on the DB and give the user to start build the project
    self.addNewProject = function () {
      var ProjectUsers = []
      ProjectUsers.push(service.Email);
      if ($scope.Description == undefined) {
        $scope.Description = "";
      }
      if ($scope.name == undefined) {
        $scope.name = "";
      }
      var json = {
        Participants: ProjectUsers,
        ProjectName: $scope.name,
        ProjectJson: service.jsonOfProject,
        ProjectOwner: service.Email,
        ProjectDescription: $scope.Description
      }
      $http.post('/AddNewProject', json).then(function (response) {
        self.getprojects();
      }, function (errResponse) {
        console.log(errResponse)
      });
      $scope.Description = "";
      $scope.name = "";
      self.closeAddWindow();
    }

    //this function to show the modal of add new project
    self.showAddWindowModal = function () {
      $('#addProjectModal').modal('show');
    };

    //this function to close the modal of add new project
    self.closeAddWindow = function () {
      $('#addProjectModal').modal('hide');
      golbalCounter = 0;
    };

    //this function to show the modal of add new project
    self.showShareWindowModal = function (i) {
      self.ProjectIClicNow = i;
      
      $('#shareProjectModal').modal('show');
    };

    //this function to close the modal of add new project
    self.closeShareWindow = function () {
      $('#shareProjectModal').modal('hide');
      self.ProjectIClicNow = {}
      golbalCounter = 0;
      $scope.UserEmail = "";
    };

    self.showParticipants = function (projectId,ProjectOwner) {
      $scope.projectIdForUpdate = projectId;
      for (var i = 0; i < $scope.projectTable.length; i++) {
        if ($scope.projectTable[i].ProjectId == projectId) {
          $scope.participantsArray = [];
          for (var j = 0; j < $scope.projectTable[i].Participants.length; j++) {
            if ($scope.projectTable[i].Participants[j] != ProjectOwner) {
              $scope.participantsArray.push($scope.projectTable[i].Participants[j]);
            }
          }
          if (service.Email == $scope.projectTable[i].ProjectOwner) {
            $('#adminParticipantsModal').modal('show');
          }
          else {
            $('#participantsModal').modal('show');
          }
        }
      }
    }

    self.editDescription = function (project) {
      $scope.projectNameEdit = project.ProjectName;
      $scope.projectDescriptionEdit = project.ProjectDescription;
      $scope.projectIdForUpdate = project.ProjectId;
      $('#editDescriptionModal').modal('show');
    }

    self.updateProjectDescription = function () {
      var request = { "ProjectName": $scope.projectNameEdit, "ProjectDescription": $scope.projectDescriptionEdit, "ProjectId": $scope.projectIdForUpdate }
      $http.post('/updateDescription', request).then(function (response) {
        self.getprojects();
        $('#editDescriptionModal').modal('hide');
      }, function (errResponse) {
        console.log(errResponse)
      });
    }

    self.deleteParticipant=function(participant){
      var projectId=$scope.projectIdForUpdate;
      json = {
        ProjectId: projectId,
        Participant: participant
      }
      $http.post('/DeleteParticipant', json).then(function (response) {
        $('#adminParticipantsModal').modal('hide');
        self.getprojects();
      }, function (errResponse) {
        console.log(errResponse)
      });
      console.log(participant);
      console.log(projectId);
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
      console.log("result now");
      console.log(result);
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
        console.log(response)
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
        console.log("answer");
        console.log(answer);
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



    self.getprojects();
    self.clearTheValues();
    self.getDBProfilesArray();



  }])
