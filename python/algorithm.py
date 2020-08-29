# this file contain the functions were called , when the user want to see the result , and the clusters paritation
import numpy as np
import pandas as pd
from sklearn.cluster import DBSCAN
from sklearn.cluster import AgglomerativeClustering
import itertools
from pandas.io.json import json_normalize
import simplejson as json
import mongodb_functions as mongo_func

def dbScanAlgotithm(mainMatrix):
    answer = []
    sim = pd.DataFrame(mainMatrix["data"][1:], columns=mainMatrix["data"][0], index=mainMatrix["data"][0])
    dist = sim.apply(inverse)
    i = 1
    db = DBSCAN(min_samples=1, metric='precomputed',eps=getEps(mainMatrix["data"][1:])).fit(dist)
    core_samples_mask = np.zeros_like(db.labels_, dtype=bool)
    core_samples_mask[db.core_sample_indices_] = True
    labels = db.labels_
    n_clusters_ = len(set(labels)) - (1 if -1 in labels else 0)
    n_noise_ = list(labels).count(-1)
    clustersRange = range(0, n_clusters_, 1)
    for j in clustersRange:
        answer.append(list(dist.index[np.nonzero(labels == j)[0]]))
    # in this loop we will check if evrey class enter in some clustrer, if not insert him with single cluster
    for className in mainMatrix["data"][0]:
        exists=False
        for arr in answer:
            if className in arr:
                exists=True
        if(exists==False):
            answer.append([className])
    # this loop is for converting the array of arrays to array of strings
    finalAnswer={"eps":getEps(mainMatrix["data"][1:])}
    stringArr=[]
    for sArr in answer:
        tmpString=""
        for element in sArr:
            tmpString=element+" , "+tmpString
        tmpString=tmpString[0:-3]
        stringArr.append(tmpString)
    finalAnswer["list"]=stringArr
    return finalAnswer


def dbScanAlgotithmArray(mainMatrix):
    answer = []
    sim = pd.DataFrame(mainMatrix["data"][1:], columns=mainMatrix["data"][0], index=mainMatrix["data"][0])
    dist = sim.apply(inverse)
    i = 1
    db = DBSCAN(min_samples=1, metric='precomputed',eps=getEps(mainMatrix["data"][1:])).fit(dist)
    core_samples_mask = np.zeros_like(db.labels_, dtype=bool)
    core_samples_mask[db.core_sample_indices_] = True
    labels = db.labels_
    n_clusters_ = len(set(labels)) - (1 if -1 in labels else 0)
    n_noise_ = list(labels).count(-1)
    clustersRange = range(0, n_clusters_, 1)
    for j in clustersRange:
        answer.append(list(dist.index[np.nonzero(labels == j)[0]]))
    # in this loop we will check if evrey class enter in some clustrer, if not insert him with single cluster
    for className in mainMatrix["data"][0]:
        exists=False
        for arr in answer:
            if className in arr:
                exists=True
        if(exists==False):
            answer.append([className])
    return answer

#this function is take array of arrays and return the mean of the values
def getEps(array):
    counter=0
    sum=0
    for arr in array:
        for element in arr:
            sum=sum+element
            counter=counter+1
    return round(float (sum/counter),2)

# we will set manually queryComplexy dist equal to 4
def getNFRDistance():
    nfrDefaultValues=mongo_func.getNFRDefaultValue()
    nfrDistanceDict={}
    for nfr , nfrJson in nfrDefaultValues.items():
        if nfrJson["type"]=='Range' :
            nfrDistanceDict[nfr]=nfrJson["max"]-nfrJson["min"]
        if nfrJson["type"]=='Select Box' :
            nfrDistanceDict[nfr]=max(nfrJson["legend"].values())-min(nfrJson["legend"].values())
        if nfrJson["type"]=='Constant' :
            nfrDistanceDict[nfr]=4
    return nfrDistanceDict

# this function responsible to return nfr avg values (anclude query complexity) for given cluster
def getClusterNfrAvgValues(cluster,nfrTable,classesComplexity):
    clusterNfrCount={}
    clusterNfrValue={}
    clusterNfrAvg={}
    for class_i in nfrTable["tableInfo"]:
        if (class_i in cluster):
            for nfr ,value in nfrTable["tableInfo"][class_i].items():
                if nfr!='key':
                    if nfr in clusterNfrCount :
                        clusterNfrValue[nfr]=clusterNfrValue[nfr]+float(value)
                        clusterNfrCount[nfr]=clusterNfrCount[nfr]+1
                    else:
                        clusterNfrValue[nfr]=float(value)
                        clusterNfrCount[nfr]=1
    for nfr ,value in clusterNfrCount.items():
        clusterNfrAvg[nfr]=clusterNfrValue[nfr]/clusterNfrCount[nfr]
    # need adding queryComplexity to nfr 
    count=0
    value=0
    for class_i ,classComplexity in classesComplexity.items():
        if (class_i in cluster):
            value=value+float(classComplexity)
            count=count+1
    try:
        clusterNfrAvg["queryComplexity"]=float(value)/float(count)
    except:
        clusterNfrAvg["queryComplexity"] = 0 # devide zero
    return(clusterNfrAvg)

# this function is return the result json of the system 
def getResult(nfrComponentValues, nfrTable, clusters, profiles,classesComplexity):
    nfrMaxDistance=getNFRDistance()
    #this array contain the avg vales of each nfr 
    clustersAvgNfr=[]
    for cluster in clusters:
        clustersAvgNfr.append(getClusterNfrAvgValues(cluster,nfrTable,classesComplexity))
    # this list save the jsons that describe the distance of each cluster from each db profile
    clusterDistanceFromDbProfiles=[]
    for j in range(0,len(clusters)):
        clusterJson={}
        clusterJson["clusterName"]=j+1
        clusterInfo=[]
        for i in range (0,len(profiles)):
            profileDistanceJson={}
            profileDistanceJson["dbName"]=profiles[i]["dbName"]
            profileDistanceJson["result"]=0
            profileDistanceJson["nfrValues"]={}
            for dbNFR ,nfrValue in profiles[i].items():
                try:
                    if(dbNFR != "dbName"):
                        profileDistanceJson["nfrValues"][dbNFR]=abs(clustersAvgNfr[j][dbNFR]-nfrValue)/nfrMaxDistance[dbNFR]
                except:
                    pass # if there is new nfr in the system , and this project havn't this nfr
            # compute result
            for key ,value in profileDistanceJson["nfrValues"].items():
                profileDistanceJson["result"]=float("{:.3f}".format(profileDistanceJson["result"]+float(value)*float(nfrComponentValues[key])))
            clusterInfo.append(profileDistanceJson)
        clusterJson["clusterInfo"]=clusterInfo
        clusterDistanceFromDbProfiles.append(clusterJson)
    return clusterDistanceFromDbProfiles

# this function is got array of json , and re write new json to send to server
def changeJsonFormat(clusterDistanceFromDbProfiles):
    newList=[]
    for i in range(0,len(clusterDistanceFromDbProfiles)):
        newJson={}
        newJson["clusterName"]=i
        data=[]
        

#to check id NFR is exist in the profile and not deleted
def checknfrIsExist(profile,nfrs):
    deletedNFR = {}
    for nfr in nfrs:
        if not (nfr in nfrs):
            deletedNFR[nfr] = 'deleted'
    return deletedNFR

#this function is to calculate the average of the in NFR in the cluster
def calculateClusterAvg(clusters, nfrTable, nfr):
    avg = 0
    nfrInfo = nfrTable['tableInfo']
    for cluster in clusters:
        i = 0
        tmpArr = []
        arr = {}
        j=0
        for (k,v) in nfrInfo.items():
            if (cluster == k):
                arr['className'] = k 
                for (nfrkey,nfrvalue) in v.items():
                    arr[nfrkey] = nfrvalue
        if (arr['className'] == cluster):
            try:
                avg = avg + float(arr[nfr])
            except:
                pass
    avg = avg / len(clusters)
    return avg

#function to return the NFR
def getNfrs(nfrTable):
    arr = nfrTable['defalutValue']
    res = []
    for (k, v) in arr.items():
            res.append(k)
    return res


#function to calculate the max distance of each nfr in the profile
def calculateMaxDist(profiles, nfrs):
    res = {}
    for i in nfrs:
        res[i] = 0
    for profile in profiles:
        for nfr in nfrs:
             try:
                if (profile[nfr] > res[nfr]):
                    res[nfr] = profile[nfr]
             except:
                 res[nfr] = 0
    return res

def inverse(x):
    return (1 - x)

