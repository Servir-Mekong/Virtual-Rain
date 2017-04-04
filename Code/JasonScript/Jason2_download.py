################################################################################
#                                                                              #
# Jason2_download.py: download Jason 2 data and start NetCDF4 reader.          #
#                                                                              #
# Program will check the existing data and only download the new data          #
# Data are saved in ../data/ directory with cycle_number sub directories       #
#                                                                              #
#                                                                              #
# History:                                                                     #
#     2016-09-01 Written, Matt He, GHRC                                        #
#                                                                              #
#                                                                              #
################################################################################
from ftplib import FTP
import sys, os

homedir = "/home/vgs/servir";


#if len(sys.argv) != 2 :
#        print("USAGE: python Jason2_download.py CycleNumber\n")
#        sys.exit(0)
#cycle_Num = sys.argv[1]

#cycle_Num = ["_001_", "_205_","_205_","_205_","_205_","_205_","_027_","_242_","_064_","_077_","_077_","_077_","_077_","_077_","_140_",     "_140_","_1_","_179_","_129_","_129_","_27_","_103_","_166_","_242_","_205_","_205_","_205_","_205_","_242_","_64_","_77_","_77_","_216_","_77_","_77_","_77_","_216_"] 
#VSG_ID = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37]

cycle_Num = ["_140_","_001_","_179_","_129_","_129_","_027_","_103_","_166_","_242_","_205_","_205_","_205_","_205_","_242_","_064_","_077_","_077_","_216_","_077_","_077_","_077_","_216_"]

VSG_ID = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22]

#First we check history folder for last processed cycle_NUM
dirname = homedir + "/data";
dirlist = []
for filename in sorted(os.listdir(dirname)):
        print (filename)
        dirlist.append(filename)

print (dirlist[-1])
lastProcessedCycleNUM = dirlist[-1]
lastProcessedCycleDir = dirname + "/" + dirlist[-1]

#Second, we check FTP for new folders and new files
dataserver  = "avisoftp.cnes.fr"
username    = "anonymous"
password    = "hey@uah.edu"

ftp = FTP(dataserver)
ftp.login(username,password)

ftpParentDir='AVISO/pub/jason-2/gdr_d'
ftp.cwd(ftpParentDir)

###get ftp dir list
ftpDirList = []
ftp.dir(ftpDirList.append)

ftpDirNames = []

for line in ftpDirList:
        ftpDirNameStrs=line.split()
        if "cycle_" in ftpDirNameStrs[-1]:
                ftpDirNames.append(ftpDirNameStrs[-1]);
#download starting with the last cycl_num
if lastProcessedCycleNUM in ftpDirNames:
        ftpIndex = ftpDirNames.index(lastProcessedCycleNUM);
        for ftpDirName in ftpDirNames[ftpIndex:]:
                print ("process folder: ", ftpDirName)
                #check if CycleNum already exist,
                currentDir = os.path.join(dirname, ftpDirName)
                if not os.path.exists(currentDir):
                        os.makedirs(currentDir)
                ftpCurrentDir = os.path.join(ftpParentDir, ftpDirName)
                ftp.cwd(ftpDirName)
                ftpCurrentFiles = ftp.nlst()
                for oneFile in ftpCurrentFiles:
                        for i in range(0, len(VSG_ID)):
                                if cycle_Num[i] in oneFile:        
                                        ftpFileStrs = oneFile.split()
                                        ftpFileName = ftpFileStrs[-1].lstrip()
                                        localFile = os.path.join(currentDir, ftpFileName)
                                        #check if file is downlaoded already, if not, download it. 	
                                        if not os.path.exists(localFile):
                                                fileptr = open(localFile, "wb")
                                                print ("download file: ", localFile)
                               	                ftp.retrbinary('RETR %s'%ftpFileName,fileptr.write)
                                                fileptr.close()
                                        #After download, process it by calling netcdf program. 
                                        cmd = "/home/vgs/anaconda3/bin/python /home/vgs/servir/bin/Jason2_readnetcdf.py " + str(VSG_ID[i])+ " " +  localFile
                                        print (cmd)
                                        os.system(cmd)
                                        #open(localFile, "w").close()
                ftp.cwd("../")


ftp.quit()
