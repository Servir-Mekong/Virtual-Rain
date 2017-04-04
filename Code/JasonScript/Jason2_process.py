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
import netCDF4,os,sys,glob,scipy,zipfile
import numpy as np
from netCDF4 import Dataset
import numpy.ma as ma
import ftplib
from collections import defaultdict
import csv
from datetime import datetime,timedelta
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib
from matplotlib import dates
from scipy import interpolate
from scipy.io import *
from scipy import stats
from datetime import datetime
import time
#matplotlib.style.use('ggplot')
global jason_cycle,lat_,lon_,work_folder


#Input section
#--------------------------------------------------------------------------------
work_folder='/home/vgs/servir'
start_date='2008/01/01'
#--------------------------------------------------------------------------------

def apply_scale(data):
    keys={}
    keys_update={}
    vars_name=[]
    scale_factor=np.ones((1,177))
    add_offset=np.zeros((1,177))

    for index,i in enumerate(data.variables):
            j=data.variables[i]

            for name in j.ncattrs():
                if name==u'scale_factor':
                    scale_factor[0,index]=getattr(j,name)
                    add_offset[0,index]=getattr(j,name)

    scale_factor=np.ravel(scale_factor)
    add_offset=np.ravel(add_offset)

    for j,var in enumerate(data.variables):
        keys[var]=data.variables[var][:]
        vars_name.append(var)

    for i,varname in enumerate(vars_name):
        if scale_factor[i]!=1 or add_offset[i]!=0:
            keys_update[varname]=scale_factor[i]*keys[varname]+add_offset[i]
        else:
            keys_update[varname]=keys[varname]

    return keys_update


def check_data_download(start_date):
    all_flist=glob.glob('*.nc')
    all_flist.sort()
    gdr_flist=sorted(glob.glob('*_GPN_*.nc'))
    end_date=datetime.now().strftime('%Y/%m/%d')
    c1,c2=date2cycle(start_date,end_date)
    ftp=ftplib.FTP('avisoftp.cnes.fr','anonymous','jayaram.pudashine@sei-international.org')
    ftp.cwd('AVISO/pub/jason-2/gdr_d')
    last_gdr_cycle=int(ftp.nlst()[-1].split('_')[1])



    if len(all_flist)!=0:
        final_range=range(c1,c2+1)
        fc1=int(all_flist[0][12:15])
        fc2=int(all_flist[-1][12:15])
        initial_range=range(fc1,fc2+1)
        #diff=list(set(final_range).difference(initial_range))
        diff=list(set(initial_range).symmetric_difference(final_range))
        gdr_cycle=int(gdr_flist[-1][12:15])


        if last_gdr_cycle>gdr_cycle:
            cycle_return=range(gdr_cycle+1,last_gdr_cycle+1)

            for i in cycle_return:
               try:
					os.remove(glob.glob('*_IPN_2PdP'+str(i)+'_*.nc')[0])
               except :
			         continue

            return cycle_return+diff

        else:
		    return diff

    else:
        return range(c1,c2+1)



def read_netCDF(File,lat_range,cf):
    data=Dataset(File)
    cycle_no=getattr(data,data.ncattrs()[15])
    pass_no=getattr(data,data.ncattrs()[17])
    #print cycle_no,pass_no
    nc_dims=[dim for dim in data.dimensions]
    dim_size=len(data.dimensions[nc_dims[0]])
    hz=len(data.dimensions[nc_dims[1]])
    time=data.variables['time'][:]
    #print len(time)
    time_20hz=data.variables['time_20hz'][:]
    lon=data.variables['lon'][:]
    lat=data.variables['lat'][:]
    lon_20hz=data.variables['lon_20hz'][:]
    lat_20hz=data.variables['lat_20hz'][:]
    surface_type=data.variables['surface_type'][:]
    alt_echo_type=data.variables['alt_echo_type'][:]
    rad_surf_type=data.variables['rad_surf_type'][:]
    rad_distance_to_land=data.variables['rad_distance_to_land'][:]
    qual_alt_1hz_range_ku=data.variables['qual_alt_1hz_range_ku'][:]
    qual_alt_1hz_range_ku_mle3=data.variables['qual_alt_1hz_range_ku_mle3'][:]
    qual_alt_1hz_range_c=data.variables['qual_alt_1hz_range_c'][:]
    qual_alt_1hz_swh_ku=data.variables['qual_alt_1hz_swh_ku'][:]
    qual_alt_1hz_swh_ku_mle3=data.variables['qual_alt_1hz_swh_ku_mle3'][:]
    qual_alt_1hz_swh_c=data.variables['qual_alt_1hz_swh_c'][:]
    qual_alt_1hz_sig0_ku=data.variables['qual_alt_1hz_sig0_ku'][:]
    qual_alt_1hz_sig0_ku_mle3=data.variables['qual_alt_1hz_sig0_ku_mle3'][:]
    qual_alt_1hz_sig0_c=data.variables['qual_alt_1hz_sig0_c'][:]
    qual_alt_1hz_off_nadir_angle_wf_ku=data.variables['qual_alt_1hz_off_nadir_angle_wf_ku'][:]
    qual_inst_corr_1hz_range_ku=data.variables['qual_inst_corr_1hz_range_ku'][:]
    qual_inst_corr_1hz_range_ku_mle3=data.variables['qual_inst_corr_1hz_range_ku_mle3'][:]
    qual_inst_corr_1hz_range_c=data.variables['qual_inst_corr_1hz_range_c'][:]
    qual_inst_corr_1hz_swh_ku=data.variables['qual_inst_corr_1hz_swh_ku'][:]
    qual_inst_corr_1hz_swh_ku_mle3=data.variables['qual_inst_corr_1hz_swh_ku_mle3'][:]
    qual_inst_corr_1hz_swh_c=data.variables['qual_inst_corr_1hz_swh_c'][:]
    qual_inst_corr_1hz_sig0_ku=data.variables['qual_inst_corr_1hz_sig0_ku'][:]
    qual_inst_corr_1hz_sig0_ku_mle3=data.variables['qual_inst_corr_1hz_sig0_ku_mle3'][:]
    qual_inst_corr_1hz_sig0_c=data.variables['qual_inst_corr_1hz_sig0_c'][:]
    qual_rad_1hz_tb187=data.variables['qual_rad_1hz_tb187'][:]
    qual_rad_1hz_tb238=data.variables['qual_rad_1hz_tb238'][:]
    qual_rad_1hz_tb340=data.variables['qual_rad_1hz_tb340'][:]
    rad_averaging_flag=data.variables['rad_averaging_flag'][:]
    rad_land_frac_187=data.variables['rad_land_frac_187'][:]
    rad_land_frac_238=data.variables['rad_land_frac_238'][:]
    rad_land_frac_340=data.variables['rad_land_frac_340'][:]
    alt_state_flag_oper=data.variables['alt_state_flag_oper'][:]
    alt_state_flag_c_band=data.variables['alt_state_flag_c_band'][:]
    alt_state_flag_band_seq=data.variables['alt_state_flag_band_seq'][:]
    alt_state_flag_ku_band_status=data.variables['alt_state_flag_ku_band_status'][:]
    alt_state_flag_c_band_status=data.variables['alt_state_flag_c_band_status'][:]
    alt_state_flag_acq_mode_20hz=data.variables['alt_state_flag_acq_mode_20hz'][:]
    alt_state_flag_tracking_mode_20hz=data.variables['alt_state_flag_tracking_mode_20hz'][:]
    rad_state_flag_oper=data.variables['rad_state_flag_oper'][:]
    orb_state_flag_diode=data.variables['orb_state_flag_diode'][:]
    orb_state_flag_rest=data.variables['orb_state_flag_rest'][:]
    ecmwf_meteo_map_avail=data.variables['ecmwf_meteo_map_avail'][:]
    rain_flag=data.variables['rain_flag'][:]
    rad_rain_flag=data.variables['rad_rain_flag'][:]
    ice_flag=data.variables['ice_flag'][:]
    rad_sea_ice_flag=data.variables['rad_sea_ice_flag'][:]
    interp_flag_tb=data.variables['interp_flag_tb'][:]
    interp_flag_mean_sea_surface=data.variables['interp_flag_mean_sea_surface'][:]
    interp_flag_mdt=data.variables['interp_flag_mdt'][:]
    interp_flag_ocean_tide_sol1=data.variables['interp_flag_ocean_tide_sol1'][:]
    interp_flag_ocean_tide_sol2=data.variables['interp_flag_ocean_tide_sol2'][:]
    interp_flag_meteo=data.variables['interp_flag_meteo'][:]
    alt=data.variables['alt'][:]
    alt_20hz=data.variables['alt_20hz'][:]
    orb_alt_rate=data.variables['orb_alt_rate'][:]
    range_ku=data.variables['range_ku'][:]
    range_20hz_ku=data.variables['range_20hz_ku'][:]
    range_c=data.variables['range_c'][:]
    range_20hz_c=data.variables['range_20hz_c'][:]
    range_used_20hz_ku=data.variables['range_used_20hz_ku'][:]
    range_used_20hz_c=data.variables['range_used_20hz_c'][:]
    range_rms_ku=data.variables['range_rms_ku'][:]
    range_rms_c=data.variables['range_rms_c'][:]
    range_numval_ku=data.variables['range_numval_ku'][:]
    range_numval_c=data.variables['range_numval_c'][:]
    range_ku_mle3=data.variables['range_ku_mle3'][:]
    range_20hz_ku_mle3=data.variables['range_20hz_ku_mle3'][:]
    range_used_20hz_ku_mle3=data.variables['range_used_20hz_ku_mle3'][:]
    range_rms_ku_mle3=data.variables['range_rms_ku_mle3'][:]
    range_numval_ku_mle3=data.variables['range_numval_ku_mle3'][:]
    number_of_iterations_ku=data.variables['number_of_iterations_ku'][:]
    number_of_iterations_ku_mle3=data.variables['number_of_iterations_ku_mle3'][:]
    number_of_iterations_c=data.variables['number_of_iterations_c'][:]
    net_instr_corr_range_ku=data.variables['net_instr_corr_range_ku'][:]
    net_instr_corr_range_ku_mle3=data.variables['net_instr_corr_range_ku_mle3'][:]
    net_instr_corr_range_c=data.variables['net_instr_corr_range_c'][:]
    model_dry_tropo_corr=data.variables['model_dry_tropo_corr'][:]
    model_wet_tropo_corr=data.variables['model_wet_tropo_corr'][:]
    rad_wet_tropo_corr=data.variables['rad_wet_tropo_corr'][:]
    iono_corr_alt_ku=data.variables['iono_corr_alt_ku'][:]
    iono_corr_alt_ku_mle3=data.variables['iono_corr_alt_ku_mle3'][:]
    iono_corr_gim_ku=data.variables['iono_corr_gim_ku'][:]
    sea_state_bias_ku=data.variables['sea_state_bias_ku'][:]
    sea_state_bias_ku_mle3=data.variables['sea_state_bias_ku_mle3'][:]
    sea_state_bias_c=data.variables['sea_state_bias_c'][:]
    sea_state_bias_c_mle3=data.variables['sea_state_bias_c_mle3'][:]
    swh_ku=data.variables['swh_ku'][:]
    swh_20hz_ku=data.variables['swh_20hz_ku'][:]
    swh_c=data.variables['swh_c'][:]
    swh_20hz_c=data.variables['swh_20hz_c'][:]
    swh_used_20hz_ku=data.variables['swh_used_20hz_ku'][:]
    swh_used_20hz_c=data.variables['swh_used_20hz_c'][:]
    swh_rms_ku=data.variables['swh_rms_ku'][:]
    swh_rms_c=data.variables['swh_rms_c'][:]
    swh_numval_ku=data.variables['swh_numval_ku'][:]
    swh_numval_c=data.variables['swh_numval_c'][:]
    swh_ku_mle3=data.variables['swh_ku_mle3'][:]
    swh_20hz_ku_mle3=data.variables['swh_20hz_ku_mle3'][:]
    swh_used_20hz_ku_mle3=data.variables['swh_used_20hz_ku_mle3'][:]
    swh_rms_ku_mle3=data.variables['swh_rms_ku_mle3'][:]
    swh_numval_ku_mle3=data.variables['swh_numval_ku_mle3'][:]
    net_instr_corr_swh_ku=data.variables['net_instr_corr_swh_ku'][:]
    net_instr_corr_swh_ku_mle3=data.variables['net_instr_corr_swh_ku_mle3'][:]
    net_instr_corr_swh_c=data.variables['net_instr_corr_swh_c'][:]
    sig0_ku=data.variables['sig0_ku'][:]
    sig0_20hz_ku=data.variables['sig0_20hz_ku'][:]
    sig0_c=data.variables['sig0_c'][:]
    sig0_20hz_c=data.variables['sig0_20hz_c'][:]
    sig0_used_20hz_ku=data.variables['sig0_used_20hz_ku'][:]
    sig0_used_20hz_c=data.variables['sig0_used_20hz_c'][:]
    sig0_rms_ku=data.variables['sig0_rms_ku'][:]
    sig0_rms_c=data.variables['sig0_rms_c'][:]
    sig0_numval_ku=data.variables['sig0_numval_ku'][:]
    sig0_numval_c=data.variables['sig0_numval_c'][:]
    sig0_ku_mle3=data.variables['sig0_ku_mle3'][:]
    sig0_20hz_ku_mle3=data.variables['sig0_20hz_ku_mle3'][:]
    sig0_used_20hz_ku_mle3=data.variables['sig0_used_20hz_ku_mle3'][:]
    sig0_rms_ku_mle3=data.variables['sig0_rms_ku_mle3'][:]
    sig0_numval_ku_mle3=data.variables['sig0_numval_ku_mle3'][:]
    agc_ku=data.variables['agc_ku'][:]
    agc_c=data.variables['agc_c'][:]
    agc_rms_ku=data.variables['agc_rms_ku'][:]
    agc_rms_c=data.variables['agc_rms_c'][:]
    agc_numval_ku=data.variables['agc_numval_ku'][:]
    agc_numval_c=data.variables['agc_numval_c'][:]
    net_instr_corr_sig0_ku=data.variables['net_instr_corr_sig0_ku'][:]
    net_instr_corr_sig0_ku_mle3=data.variables['net_instr_corr_sig0_ku_mle3'][:]
    net_instr_corr_sig0_c=data.variables['net_instr_corr_sig0_c'][:]
    atmos_corr_sig0_ku=data.variables['atmos_corr_sig0_ku'][:]
    atmos_corr_sig0_c=data.variables['atmos_corr_sig0_c'][:]
    off_nadir_angle_wf_ku=data.variables['off_nadir_angle_wf_ku'][:]
    off_nadir_angle_wf_20hz_ku=data.variables['off_nadir_angle_wf_20hz_ku'][:]
    tb_187=data.variables['tb_187'][:]
    tb_238=data.variables['tb_238'][:]
    tb_340=data.variables['tb_340'][:]
    tb_187_smoothed=data.variables['tb_187_smoothed'][:]
    tb_238_smoothed=data.variables['tb_238_smoothed'][:]
    tb_340_smoothed=data.variables['tb_340_smoothed'][:]
    mean_sea_surface=data.variables['mean_sea_surface'][:]
    mean_topography=data.variables['mean_topography'][:]
    geoid=data.variables['geoid'][:]
    bathymetry=data.variables['bathymetry'][:]
    inv_bar_corr=data.variables['inv_bar_corr'][:]
    hf_fluctuations_corr=data.variables['hf_fluctuations_corr'][:]
    ocean_tide_sol1=data.variables['ocean_tide_sol1'][:]
    ocean_tide_sol2=data.variables['ocean_tide_sol2'][:]
    ocean_tide_equil=data.variables['ocean_tide_equil'][:]
    ocean_tide_non_equil=data.variables['ocean_tide_non_equil'][:]
    load_tide_sol1=data.variables['load_tide_sol1'][:]
    load_tide_sol2=data.variables['load_tide_sol2'][:]
    solid_earth_tide=data.variables['solid_earth_tide'][:]
    pole_tide=data.variables['pole_tide'][:]
    wind_speed_model_u=data.variables['wind_speed_model_u'][:]
    wind_speed_model_v=data.variables['wind_speed_model_v'][:]
    wind_speed_alt=data.variables['wind_speed_alt'][:]
    wind_speed_alt_mle3=data.variables['wind_speed_alt_mle3'][:]
    wind_speed_rad=data.variables['wind_speed_rad'][:]
    rad_water_vapor=data.variables['rad_water_vapor'][:]
    rad_liquid_water=data.variables['rad_liquid_water'][:]
    ice_range_20hz_ku=data.variables['ice_range_20hz_ku'][:]
    ice_range_20hz_c=data.variables['ice_range_20hz_c'][:]
    ice_sig0_20hz_ku=data.variables['ice_sig0_20hz_ku'][:]
    ice_sig0_20hz_c=data.variables['ice_sig0_20hz_c'][:]
    ice_qual_flag_20hz_ku=data.variables['ice_qual_flag_20hz_ku'][:]
    mqe_20hz_ku=data.variables['mqe_20hz_ku'][:]
    mqe_20hz_ku_mle3=data.variables['mqe_20hz_ku_mle3'][:]
    mqe_20hz_c=data.variables['mqe_20hz_c'][:]
    peakiness_20hz_ku=data.variables['peakiness_20hz_ku'][:]
    peakiness_20hz_c=data.variables['peakiness_20hz_c'][:]
    ssha=data.variables['ssha'][:]
    ssha_mle3=data.variables['ssha_mle3'][:]
    time_20hz_units=data.variables['time_20hz'].units
    mjd_20hz=[]
    hght=[]
    longt=[]
    latd=[]
    bs=[]

    for i in range(0,dim_size):


        #if lat[i]<lat_range[0] or lat[i]>lat_range[1]:
         #   continue

        try:
            model_dry_tropo_corr[i].mask=True
            model_wet_tropo_corr[i].mask=True
            continue

        except Exception:
            pass


        try:
            iono_corr_gim_ku[i].mask=True
            continue

        except Exception:
            pass


        try:
            solid_earth_tide[i].mask=True
            pole_tide[i].mask=True
            continue

        except Exception:
            pass


        if alt_state_flag_ku_band_status[i]!=0:
            continue


        media_corr=model_dry_tropo_corr[i]+model_wet_tropo_corr[i]+iono_corr_gim_ku[i]+solid_earth_tide[i]+pole_tide[i]



        for j in range(0,hz):

            try:
                lat_20hz[i,j].mask=True


                continue

            except Exception:
                pass


            if (lat_20hz[i,j]<lat_range[0] or lat_20hz[i,j]>lat_range[1]):
                continue



            if ice_qual_flag_20hz_ku[i,j]!=0:
                continue

            if lon_20hz[i,j]=='nan':
                continue

            mjd_20hz.append(time_20hz[i,j])
            latd.append(lat_20hz[i,j])
            longt.append(lon_20hz[i,j])
            hght.append(alt_20hz[i,j]-(media_corr+ice_range_20hz_ku[i,j]))
            bs.append(ice_sig0_20hz_ku[i,j])


    if len(latd)>0:
        longitude=(np.array(longt)).mean()
        latitude=(np.array(latd)).mean()
        back_scatter=(np.array(bs)).mean()
        mjd_20hz=(np.array(mjd_20hz)).mean()

        mjd=netCDF4.num2date(mjd_20hz,time_20hz_units,calendar='gregorian')
        ht=np.array(hght)
        height=ht-cf
        hgt=height.mean()
        return mjd,hgt,longitude,latitude,back_scatter
    else:
        return 'NULL'



def download_data(Pass,cycles):
    product='Jason2'
    ftp=ftplib.FTP('avisoftp.cnes.fr','anonymous','jayaram.pudashine@sei-international.org')
    parent_dir='AVISO/pub/jason-2/gdr_d'
    ftp.cwd(parent_dir)
    print 'Connected to data server...'

    for cycleNUM in cycles:

        try:
            ftp.cwd('cycle_'+str(cycleNUM).zfill(3))
            filename=ftp.nlst('*_'+str(Pass).zfill(3)+'_*')

        except:

            ftp.cwd('..')


            try:

                ftp.cwd('./igdr/cycle_'+str(cycleNUM).zfill(3))
                filename=ftp.nlst('*_'+str(Pass).zfill(3)+'_*')

            except:

                print "Nothing to download...Updated already!"
                continue


        if len(filename)>0:

            print "Cycle : ",cycleNUM
            ftp.retrbinary('RETR %s'%filename[0],open(filename[0],'wb').write)
            if filename[0].endswith('.zip')==True:
                with zipfile.ZipFile(filename[0],'r') as z:
                    z.extractall()
            ftp.cwd('..')



def date2cycle(date1,date2):
    global sd1,ed1
    columns = defaultdict(list)
    ##Reading the CSV and creating a list for columns
    with open(jason_cycle) as f:
        reader = csv.DictReader(f)
        for row in reader:
            for (k,v) in row.items():
                columns[k].append(v)


    dates=columns['Date']
    cycle=columns['Cycle']
    ##Changing the dateformat from string to date
    DTlist = [datetime.strptime(date,'%Y/%m/%d').date() for date in dates]
    dt=datetime.strptime(date1,"%Y/%m/%d").date()
    ##Searching the given date within the list. If not found, pick the previous closest date
    out1=min(DTlist,key=lambda date:abs(dt-date))
    ##Get the index number for the matched date and find the cycle number
    index1=DTlist.index(out1)
    sd1=int(cycle[index1])
    dt=datetime.strptime(date2,"%Y/%m/%d").date()
    out1=min(DTlist,key=lambda date:abs(dt-date))
    index1=DTlist.index(out1)
    ed1=int(cycle[index1])
    return sd1,ed1


def Geoidalcorrection():
    x=loadmat(os.path.join(work_folder,'geoidegm2008grid.mat'))
    iy=interpolate.interp2d(x['lonbp'],x['latbp'],x['grid'])
    corr=iy(lon_,lat_)[0]
    return corr



# Main program section
#----------------------------------------------------------------------------------

jason_cycle=os.path.join(work_folder,'Jason2_Cycle.csv')
os.chdir(work_folder)

#Read vsg_location.csv
vsg_loc=np.genfromtxt('vsg_locations_Jason.csv',delimiter=',',names=True)
#Loop through all the VSG Locations

for i in range(0,len(vsg_loc)):#len(vsg_loc)
    print "VSG_ID.."+str(vsg_loc['VSG_ID'][i])
    VSG_Id=vsg_loc['VSG_ID'][i]
    Pass_No=int(vsg_loc['Pass_No'][i])
    print "Pass No :",Pass_No
    lat1=vsg_loc['Lat_lower'][i]
    lat2=vsg_loc['Lat_Upper'][i]
    lon_=(float(vsg_loc['Long_left'][i])+float(vsg_loc['Long_right'][i]))/2
    lat_=(float(vsg_loc['Lat_lower'][i])+float(vsg_loc['Lat_Upper'][i]))/2

    #downloading data
    if not os.path.exists('vsg_Jason_'+str(VSG_Id)):
        os.mkdir('vsg_Jason_'+str(VSG_Id))


    os.chdir('./vsg_Jason_'+str(VSG_Id))
    file_list_old=glob.glob('*.nc')
    cc=check_data_download(start_date)
    print cc
    download_data(Pass_No,cc)
    corr_factor=Geoidalcorrection()
    height=[]
    dt=[]
    latt=[]
    lonn=[]

    file_list_new=glob.glob('*.nc')

    diff=list(set(file_list_old).symmetric_difference(file_list_new))

    if len(diff)>0:

        for f in diff:
            if read_netCDF(f,[lat1,lat2],corr_factor)!='NULL':
                mjd,hght,lon,lat,bs=read_netCDF(f,[lat1,lat2],corr_factor)
                print f
                dt.append(mjd)
                height.append(round(hght,3))

        temp=pd.DatetimeIndex(dt)
        all_data=pd.DataFrame(index=temp.date)
        all_data.index.name='Date'
        all_data['Time']=temp.time
        all_data['Water_Level']=height
        all_data.sort_index(inplace=True)
        read_csv=pd.read_csv('VSG_Id_'+str(i)+'_Lat'+str(round(lat_,3))+'_Lon'+str(round(lon_,3))+'.csv',index_col=0)
        read_csv.append(all_data)
        filter_data=read_csv[read_csv['Water_Level'] >0]
        filter_data_std=filter_data[np.abs(stats.zscore(filter_data['Water_Level'])) < 3]
        filter_data_std.to_csv('VSG_Id_'+str(i)+'_Lat'+str(round(lat_,3))+'_Lon'+str(round(lon_,3))+'.csv')

        print filter_data_std



    '''
    file_list=glob.glob('*.nc')

    for f in file_list:
        if read_netCDF(f,[lat1,lat2],corr_factor)!='NULL':
            mjd,hght,lon,lat,bs=read_netCDF(f,[lat1,lat2],corr_factor)
            print f
            dt.append(mjd)
            height.append(round(hght,3))

    temp=pd.DatetimeIndex(dt)
    all_data=pd.DataFrame(index=temp.date)
    all_data.index.name='Date'
    all_data['Time']=temp.time
    all_data['Water_Level']=height
    all_data.sort_index(inplace=True)
    filter_data=all_data[all_data['Water_Level'] >0]
    filter_data_std=filter_data[np.abs(stats.zscore(filter_data['Water_Level'])) < 3]
    filter_data_std.to_csv('VSG_Id_'+str(i)+'_Lat'+str(round(lat_,3))+'_Lon'+str(round(lon_,3))+'.csv')



    fig=all_data.plot(marker="H",linewidth='2')
    plt.title('Location :'+'Lon :' +str(round(lon_,2))+' Lat : '+str(round(lat_,2))+', Pass: '+str(Pass_No), weight='bold',fontsize=16)
    plt.ylabel('Water Level w.r.t EGM 2008 (m)',fontsize=14)
    plt.xlabel('Date',fontsize=14)
    ax=plt.gca()
    ax.get_yaxis().get_major_formatter().set_useOffset(False)
    ax.xaxis.set_major_formatter(dates.DateFormatter('%Y.%m'))
    plt.show()
    '''
    os.chdir('..')

