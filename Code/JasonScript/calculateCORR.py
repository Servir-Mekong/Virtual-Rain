#-------------------------------------------------------------------------------
# Name:         Read NetCDF file for Jason 2
# Purpose:      MEKONG SERVIR Virtual Rain and Stream Gauge Tool
# Author:       Jayaram Pudashine
# Created:      03/04/2016
# Last Modified 06/19/2016
# Copyright:    (c) Jaya 2016
# Email :       jayaram.pudashine@sei-international.org
# Version:      1.0

#-------------------------------------------------------------------------------
import os,sys,glob,scipy,zipfile
import numpy as np
import numpy.ma as ma
import csv
from scipy import interpolate
from scipy.io import *
from scipy import stats
#matplotlib.style.use('ggplot')
global jason_cycle,lat_,lon_,work_folder

def Geoidalcorrection():
    x=loadmat('geoidegm2008grid.mat')
    iy=interpolate.interp2d(x['lonbp'],x['latbp'],x['grid'])
    corr=iy(lon_,lat_)[0]
    return corr

lat_1 = []
lat_2 = []
corr_f = []
#Read vsg_location.csv
vsg_loc=np.genfromtxt('vsg_locations_Jason.csv',delimiter=',',names=True)
#Loop through all the VSG Locations

for i in range(0,len(vsg_loc)):#len(vsg_loc)
    VSG_Id=vsg_loc['VSG_ID'][i]
    Pass_No=int(vsg_loc['Pass_No'][i])
    lat1=vsg_loc['Lat_lower'][i]
    lat2=vsg_loc['Lat_Upper'][i]
    lon_=(float(vsg_loc['Long_left'][i])+float(vsg_loc['Long_right'][i]))/2
    lat_=(float(vsg_loc['Lat_lower'][i])+float(vsg_loc['Lat_Upper'][i]))/2


    corr_factor=Geoidalcorrection()
    lat_1.append(lat1)
    lat_2.append(lat2)
    corr_f.append(corr_factor)
    print("i, [lat1, lat2], corr_factor === %d,%f, %f, %f \n"%(i, lat1, lat2, corr_factor))
    #mjd,hght,lon,lat,bs=read_netCDF(f,[lat1,lat2],corr_factor)
print(lat_1);
print(lat_2);
print(corr_f);
