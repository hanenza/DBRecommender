import pymongo
import global_vars
import smtplib, ssl
import app
import copy
mongo=app.mongo

#function to login
def login(requestData):
    if(checkAdmin(requestData)):
        return global_vars.admin
    users = mongo.db.users
    for x in users.find({"Email":requestData["Email"]}):
        if((x["Password"]==requestData["Password"])):
            del x["_id"]
            return x
    return {'data': "Login failed ,User Name Or Password Is Incorrect"}

#function for register
def registerUser(requestData):
    users = mongo.db.users
    #check if the user is exist
    for x in users.find({"Email":requestData["Email"]}):
        return ({'data': "Email Is Exist"}) 
    new_user = users.insert_one(requestData)
    return ({'data': "Registered succsefuly!"})

# this functions return the 
def checkAdmin(requestData):
    if(requestData['Email']==global_vars.admin["Email"] and requestData['Password']==global_vars.admin['Password'] ):
        return True
    return False

#get the information of the user from the DB
def getUsersInfo(requestData):
    if(checkAdmin(requestData)):
        users = mongo.db.users
        usersArray=[]
        for user in users.find():
            del user["_id"]
            del user["Password"]
            usersArray.append(user) 
        return usersArray
    return {'data': "this data is available only for the admin"}

# this function delete user from the db
def deleteUser(requestData):
    if(checkAdmin(requestData)):
        users = mongo.db.users
        users.delete_one({"Email":requestData["UserEmail"]})
        return {'data': "deleting is done"}
    return {'data': "this data is available only for the admin"}

# this function return system questions
def getQuestion(requestData):
    questions = mongo.db.questions
    questionsArray=[]
    for question in questions.find():
        del question["_id"]
        questionsArray.append(question) 
    return questionsArray# this function is id genrator

# this function ass question to db
def addQuestion(requestData):
    if(checkAdmin(requestData)):
        questions = mongo.db.questions
        questions.insert_one({"question":requestData["question"]})
        return {'data': "add question is done"}
    return {'data': "this data is available only for the admin"}

# this function delete question from the db
def deleteQuestion(requestData):
    if(checkAdmin(requestData)):
        questions = mongo.db.questions
        questions.delete_one({"question":requestData["question"]})
        return {'data': "Deleting Is Done"}
    return {'data': "this data is available only for the admin"}

# the function return db profiles  
def getDBProfiles(requestData):
    if(checkAdmin(requestData)):
        dbProfiles = mongo.db.dbProfiles
        dbProfilesArray=[]
        for profile in dbProfiles.find():
            del profile["_id"]
            dbProfilesArray.append(profile) 
        return dbProfilesArray
    return {'data': "this data is available only for the admin"}

# this function return the db profiles for public info
def getDBProfilesPublic(requestData):
    dbProfiles = mongo.db.dbProfiles
    dbProfilesArray=[]
    for profile in dbProfiles.find():
        dbProfilesArray.append([profile["dbName"]]) 
    return dbProfilesArray

# this function reutrn the profiles details
def getDBProfileDetails(requestData):
    if(checkAdmin(requestData)):
        dbProfiles = mongo.db.dbProfiles
        for profile in dbProfiles.find({"dbName":requestData["dbName"]}):
            del profile["_id"]
            del profile["dbName"]
            return profile
    return {'data': "this data is available only for the admin"}

# this function like the above functions but this functions called only from the server
def getLocalDBProfiles():
    dbProfiles = mongo.db.dbProfiles
    dbProfilesArray=[]
    for profile in dbProfiles.find():
        del profile["_id"]
        dbProfilesArray.append(profile) 
    return dbProfilesArray

# this function delete db profile from the db
def deleteDBProfile(requestData):
    if(checkAdmin(requestData)):
        dbProfiles = mongo.db.dbProfiles
        dbProfiles.delete_one({"dbName":requestData["dbName"]})
        return {'data': "Deleting Is Done"}
    return {'data': "this data is available only for the admin"}

#this function add db profile to db 
def addDBProfile(requestData):
    if(checkAdmin(requestData)):
        dbProfiles = mongo.db.dbProfiles
        for x in dbProfiles.find({"dbName":requestData["db"]["dbName"]}):
            return ({'data': "DB name Is Exist"}) 
        dbProfiles.insert_one(requestData["db"])
        return {'data': "add Is Done"}
    return {'data': "this data is available only for the admin"}

def getNFRDefaultValue():
    NFRDefaultValue = mongo.db.NFRDefaultValue
    for x in NFRDefaultValue.find():
        del x["_id"]
        return (x) 

def getProjectNFRDefaultValue(projectId):
    NFRDefaultValue = mongo.db.NFRDefaultValue
    for x in NFRDefaultValue.find():
        del x["_id"]
        return (x) 

def getComponentDefaultValues():
    ComponentDefaultValues = mongo.db.ComponentDefaultValues
    for x in ComponentDefaultValues.find():
        del x["_id"]
        return (x) 
    # if mongo db is empty
    ComponentDefaultValues.insert_one({'uml': 0.4, 'sql': 0.3,'nfr': 0.3})
    return ({'uml': 0.4, 'sql': 0.3,'nfr': 0.3})

# after updating we need to check the db profiles and check them values , delete and adding new ones if needed
def updateDefaultNFR(requestData):
    if(checkAdmin(requestData)):
        NFRDefaultValue = mongo.db.NFRDefaultValue
        NFRDefaultValue.delete_many({})
        updatingNFR=updateTheDBAfterDeleteNFR(requestData["nfrValues"])
        updateDBProfilesAfterUpdatingTheNFRValues(requestData["nfrValues"])
        NFRDefaultValue.insert_one(updatingNFR)
        return {'data': "Updating The NFR Values Is Done"}
    return {'data': "this data is available only for the admin"}


def updateDBProfilesAfterUpdatingTheNFRValues(nfrValues):
    dbProfiles = mongo.db.dbProfiles
    nfrValuesArray=[]
    for key,value in nfrValues.items():
        nfrValuesArray.append(key)
    # adding new NFR Values for currents db profiles
    for nfr in nfrValuesArray:
        for profile in dbProfiles.find():
            if not nfr in profile:
                oldProfile=copy.deepcopy(profile)
                profile[nfr]=0
                newtProfile={"$set":profile}
                dbProfiles.update_one(oldProfile, newtProfile)
    # delete irrlevant nfr from the db profiles
    for profile in dbProfiles.find():
        newtProfile={}
        for key,value in (profile.items()):
            if(key in nfrValuesArray or key=="dbName"):
                newtProfile[key]=value
        try:
            dbProfiles.delete_one({"dbName":profile["dbName"]})
        except:
            pass
        dbProfiles.insert_one(newtProfile)

def updateDescription(requestData):
    project = mongo.db.Project
    oldValue={}
    newtValue={"$set":{"ProjectDescription":requestData["ProjectDescription"],"ProjectName":requestData["ProjectName"]}}
    for x in project.find({"ProjectId":requestData["ProjectId"]}):
        oldValue=x
        break
    project.update_one(oldValue, newtValue)
    return {'data': "Updating The Project Description Is Done"}

def updateDBProfile(requestData):
    if(checkAdmin(requestData)):
        dbProfiles = mongo.db.dbProfiles
        dbProfile={"$set":requestData["dbProfile"]}
        for x in dbProfiles.find({"dbName":requestData["dbName"]}):
            dbProfiles.update_one(x, dbProfile)
            return {'data': "Updating The DB Profile Values Is Done"}
    return {'data': "this data is available only for the admin"}

# this function is responsible for updting the nfr wight after deleting any of them
def updateTheDBAfterDeleteNFR(nfrJson):
    print(nfrJson)
    sum=0
    for key,value in nfrJson.items():
        sum=sum+ float(value["value"]) 
    if(1-sum!=0):
        for key,value in nfrJson.items():
            nfrJson[key]["value"]=float(value["value"])+1-sum
            return nfrJson
    return nfrJson

def updateDefaultComponent(requestData):
    if(checkAdmin(requestData)):
        ComponentDefaultValues = mongo.db.ComponentDefaultValues
        oldComponenValue={}
        newComponentValue={"$set":requestData["componentValues"]}
        for x in ComponentDefaultValues.find():
            oldComponenValue=x
        ComponentDefaultValues.update_one(oldComponenValue, newComponentValue)
        return {'data': "Updating The Component Values Is Done"}
    return {'data': "this data is available only for the admin"}

def AddNewProject(requestData):
    project = mongo.db.Project
    if(requestData["ProjectId"]>0):
        new_project = project.insert_one(requestData)
        return ({'data': "Adding New Project succsefuly!"})
    return ({'data': "Project Id Is Illegal"})

# this function is id genrator
def getProjects(requestData):
    project = mongo.db.Project
    AllProjects=[]
    for p in project.find():
        if requestData["UserName"] in p["Participants"]:
            del p["_id"]
            AllProjects.append(p)
    return AllProjects

def getProject(requestData):
    project = mongo.db.Project
    projectJson={}
    for p in project.find({"ProjectId":requestData["ProjectId"]}):
        del p["_id"]
        return p
    return projectJson

def getProjectjson(requestData):
    project = mongo.db.Project
    projectJson={}
    for p in project.find({"ProjectId":requestData["ProjectId"]}):
        del p["_id"]
        projectJson=p["ProjectJson"]
    return projectJson

def getProject(requestData):
    project = mongo.db.Project
    projectJson={}
    for p in project.find({"ProjectId":requestData["ProjectId"]}):
        del p["_id"]
        projectJson=p
    return projectJson

def UpdateProjectJson(requestData):
    if(requestData["ProjectId"]>0):
        project = mongo.db.Project
        doc = project.find_one_and_update(
            {"ProjectId": requestData["ProjectId"]},
            {"$set":{"ProjectJson": requestData["ProjectJson"]}},upsert=True
        )
        for p in project.find({"ProjectId":requestData["ProjectId"]}):
            return ({'data': "Project json is updated"})
    else:
        return ({'data': "Project Id Is Illegal"})


def ShareProject(requestData):
    users = mongo.db.users
    userIsExist=False
    for x in users.find({"Email": requestData["NewParticipant"]}):
         AddParticipant(requestData)
         userIsExist=True
    if(userIsExist):
      return ({'data': "Adding New Participant succsefuly!"})
    return ({'data': "User Is Not Exist!"})

def AddParticipant(requestData):
    project = mongo.db.Project
    for p in project.find({"ProjectId": requestData["ProjectId"]}):
        Participants=p["Participants"]
    if(requestData["NewParticipant"] not in Participants):
        Participants.append(requestData["NewParticipant"])
        doc = project.find_one_and_update(
            {"ProjectId": requestData["ProjectId"]},
            {"$set":
                {"Participants":Participants }
            },
            upsert=True
        )

def DeleteAllParticipants(requestData):
    project = mongo.db.Project
    for p in project.find({"ProjectId": requestData["ProjectId"]}):
        Participants=[]
    doc = project.find_one_and_update(
        {"ProjectId": requestData["ProjectId"]},
        {"$set":
             {"Participants":Participants }

         },
        upsert=True
    )
    return ({'data': "Delete Participant succsefuly!"})

def DeleteParticipant(requestData):
    project = mongo.db.Project
    for p in project.find({"ProjectId": requestData["ProjectId"]}):
        Participants=p["Participants"]
    Participants.remove(requestData["Participant"])
    doc = project.find_one_and_update(
        {"ProjectId": requestData["ProjectId"]},
        {"$set":
             {"Participants":Participants }

         },
        upsert=True
    )
    return ({'data': "Delete Participant succsefuly!"})

def deleteNotRelevantProject():
    project = mongo.db.Project
    project.delete_one({"ProjectId":-1})

def getNewProjectId():
    projectCounter = mongo.db.projectCounter
    counter=0
    for p in projectCounter.find():
        counter=p['counter']
    # if the db is empty - insert ther initail value , first project will start with id : 1
    if(counter==0):
        projectCounter.insert_one({"counter":1})
        counter=1
    oldCounter={"counter":counter}
    newCounter={"$set":{"counter":counter+1}}
    projectCounter.update_one(oldCounter, newCounter)
    return counter


def DeleteProject(requestData):
    project = mongo.db.Project
    project.delete_one({"ProjectId": requestData["ProjectId"]})
    return ({'data': "Delete Project succsefuly!"})


def getAllprojects(requestData):
    project = mongo.db.Project
    AllProjects=[]
    for p in project.find():
            del p["_id"]
            AllProjects.append(p)
    return AllProjects


def restPassword(requestData):
    users = mongo.db.users
    password=""
    userName=""
    for x in users.find(requestData):
        password=x["Password"]
        username=x["FirstName"]+" "+x["LastName"]
        break
    send_email("db.selection.bgu@gmail.com","ASdf1234",requestData["Email"],"Rest Password" ,"Hello "+username+",\n\nYour Password Is :"+password+"\n\nDB Selection System")
    return {'data': "Rest Password Request Is Done"}

def send_email(user, pwd, recipient, subject, body):
    import smtplib
    FROM = user
    TO = recipient if isinstance(recipient, list) else [recipient]
    SUBJECT = subject
    TEXT = body
    # Prepare actual message
    message = """From: %s\nTo: %s\nSubject: %s\n\n%s
    """ % (FROM, ", ".join(TO), SUBJECT, TEXT)
    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.ehlo()
        server.starttls()
        server.login(user, pwd)
        server.sendmail(FROM, TO, message)
        server.close()
    except:
        print ("failed to send mail")


