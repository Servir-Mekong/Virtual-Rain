################################################################################
#                                                                              #
# Jason2_repo.py: Reprocess Jason 2 data and add results to database.          # 
#                                                                              #
# Currently we can adjust starting/ending cycle number by changing k range.    #
#                                                                              #
#                                                                              #
#                                                                              #
#                                                                              #
# History:                                                                     #
#     2016-10-01 Written, Matt He, GHRC                                        #
#                                                                              #
#                                                                              #
################################################################################ 
from ftplib import FTP
import sys, os

homedir = "/home/vgs/servir";


cycle_Num = ["_140_","_001_","_179_","_129_","_129_","_027_","_103_","_166_","_242_","_205_","_205_","_205_","_205_","_242_","_064_","_077_","_077_","_216_","_077_","_077_","_077_","_216_"]

VSG_ID = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22]
#cycle_Num = ["_001_", "_205_","_205_","_205_","_205_","_205_","_027_","_242_","_064_","_077_","_077_","_077_","_077_","_077_","_140_",     "_140_","_1_","_179_","_129_","_129_","_27_","_103_","_166_","_242_","_205_","_205_","_205_","_205_","_242_","_64_","_77_","_77_","_216_","_77_","_77_","_77_","_216_"]
#VSG_ID = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37]

#cycle_Num = ["_001_", "_205_","_205_","_205_","_205_","_205_","_027_","_242_","_064_","_077_","_077_","_077_","_077_","_077_","_140_"] 
#VSG_ID = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]

dirname = homedir + "/data";
dirlist = []

for k in range(90, 299):
	cycleName = "cycle_" + str(k)
	if k < 100:
		cycleName = "cycle_0"+ str(k)
	if k < 10:
		cycleName = "cycle_00"+ str(k)
	filedir = dirname + "/" + cycleName
	for filename in sorted(os.listdir(filedir)):
		for i in range(0, len(VSG_ID)):
			if cycle_Num[i] in filename:
				localFile = os.path.join(filedir, filename)
				cmd = "/home/vgs/anaconda3/bin/python /home/vgs/servir/bin/Jason2_readnetcdf.py " + str(VSG_ID[i])+ " " +  localFile
				print (cmd)
				os.system(cmd)
