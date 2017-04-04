################################################################################
#                                                                              #
# Jason2_readnetcdf.py: start NetCDF4 reader, process Jason2 data file.        #
#                                                                              #
# Main program was written by Jayaram Pudahine                                 #
#                                                                              #
# To Do: Adding data trimming function to remove spike values                  #
#                                                                              #
# History:                                                                     #
#     2016-09-01 Written, Matt He, GHRC                                        #
#                                                                              #
#                                                                              #
################################################################################
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
from datetime import datetime,timedelta
from scipy import interpolate
from scipy.io import *
from scipy import stats
from datetime import datetime
import time
global jason_cycle,lat_,lon_,work_folder


#Input section
#--------------------------------------------------------------------------------
work_folder='/home/vgs/servir'
start_date='2008/01/01'
#--------------------------------------------------------------------------------



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



def is_number(s):
    try:
        float(s)
        return True
    except valueError:
        return False

if len(sys.argv) != 3 :
        print("USAGE: python Jason2_readnetcdf.py VSG_ID netCDF_FileName\n")
        sys.exit(0)
VSG_ID = sys.argv[1]
dataFileName = sys.argv[2]


lat1 = [12.002012, 12.492662, 18.324416, 20.090311, 22.870127, 16.672324, 12.323246, 16.497087, 24.245885, 16.459541, 16.272259, 16.459541, 18.219170, 21.902541, 25.088243, 11.790168, 11.955464, 21.017902, 9.971145, 10.101204, 15.464265, 14.0]

lat2 = [12.019098, 12.533555, 18.348670, 20.110374, 22.891298, 16.700144, 12.356755, 16.520976, 24.283141, 16.496886, 16.307903, 16.496886, 18.227845, 21.920068, 25.093294, 11.943038, 11.994595, 21.081763, 9.998633, 10.126308, 15.504616, 14.026]

corr_factor = [-11.31879179444762, -16.922720435943809, -29.818597943347047, -52.556809468334961, -56.459128735154863, -41.437776576209657, -34.00102659107155, -49.765608389687884, -56.080998124720431, -51.847557075861005, -51.517995131559161, -51.358661913216906, -50.215745232130182, -48.271834507129277, -46.011161781216721, -3.5004543001888213, -3.5109513718989591, -28.80724626372762, -3.5353221666739065, -3.609254677025147, -7.9724865370391678, -6.4691859506793099]

#lat1 = [12.002, 12.493, 18.324, 20.09, 22.870, 16.672, 12.323, 16.497, 24.246, 16.460, 16.272, 16.460, 18.219, 21.903, 25.088, 11.79, 11.955, 21.018, 9.971, 10.101, 15.464, 14.0]

#lat2 = [12.019, 12.534, 18.349, 20.110, 22.891, 16.700, 12.357, 16.521, 24.283, 16.497, 16.308, 16.497, 18.228, 21.920, 25.093, 11.943, 11.995, 21.082, 9.999, 10.126, 15.505, 14.026]

#corr_factor = [-11.318654720691191, -16.923407357132302, -29.81862639871968, -52.557504360364675, -56.458249763240204, -41.437504947948874, -34.001025676349592, -49.765568321965432, -56.081009621466514, -51.847855774346996, -51.517892777087006, -51.359009776687166, -50.215747942778272, -48.272120042091245, -46.01133104283663, -3.5001953294684127, -3.5108737042555394, -28.807165461867832, -3.5355257409457566, -3.6089111834956134, -7.9727898071323384, -6.4691859506793099]



#corr_factor = [-16.952781,-51.611734,-51.541138,-51.501700,-51.379287,-50.224715,-41.671078,-48.305766,-46.032387,-3.168344, -3.276979,-3.558112,-3.622770,-7.971678, -4.725487,  -11.318655,-16.923407,-29.818626,-52.557504,-56.45825,-41.437505,-34.001026,-49.765568,-56.08101,-51.847856,-51.517893,-51.35901,-50.215748,-48.27212,-46.011331,-3.500195,-3.510874,-28.807165,-3.535526,-3.608911,-7.97279,-6.469186 ]
#lat1        = [12.516000,16.200000,16.280000,16.335000,16.473000,18.222000,16.503000,21.907000,25.091000,9.542000,9.624000,9.987000,10.103000,15.477000,10.208000,    12.002,12.493,18.324,20.09,22.87,16.672,12.323,16.497,24.246,16.46,16.272,16.46,18.219,21.903,25.088,11.79,11.955,21.018,9.971,10.101,15.464,14]
#lat2        = [12.526000,16.227000,16.301000,16.342000,16.491000,18.229000,16.511000,21.915000,25.097000,9.554000,9.639000,9.996000,10.110000,15.488000,10.221000,    12.019,12.534,18.349,20.11,22.891,16.7,12.357,16.521,24.283,16.497,16.308,16.497,18.228,21.92,25.093,11.943,11.995,21.082,9.999,10.126,15.505,14.026]

i = int(VSG_ID) - 1
#for i in range(0,len(lat1)):#len(vsg_loc)
#process data file with netcdf reader. 
if read_netCDF(dataFileName,[lat1[i],lat2[i]],corr_factor[i])!='NULL':
    mjd,hght,lon,lat,bs=read_netCDF(dataFileName,[lat1[i],lat2[i]],corr_factor[i])
#        print ("mjd, hght, lon, lat, bs = %s, %f, %f, %f, %f\n"%(mjd, hght, lon, lat, bs))
#/home/vgs/anaconda3/bin/python Jason2_addtodb.py 15 JA2_GPN_2PdP292_001_20160605_121114_20160605_130727.nc -6.996873  103.617647 10.214537 13.114000 2016-06-05 12:42:49.33339
#if the values are reasonable, start Jason2_addtodb.py to add results to database. 
    if is_number(hght) and is_number(lat) and is_number(lon) and is_number(bs):
        cmd = "/home/vgs/anaconda3/bin/python /home/vgs/servir/bin/Jason2_addtodb.py " + VSG_ID + " " + os.path.splitext(os.path.basename(dataFileName))[0] + " " + str(hght) + " " + str(lon) + " " + str(lat) + " " + str(bs) + " " + str(mjd)
        print (cmd)
        os.system(cmd)
