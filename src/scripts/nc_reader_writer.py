from netCDF4 import Dataset
import numpy

location = r"D:\Documents\ADPC\Projects\VRSGS\src\data\TH_chirps-v2.0.2018.04.days_p05.nc"

dataset = Dataset(location)
variables = dataset.variables
print variables['latitude'][:]
latitude = numpy.array(variables['latitude'][:])
#print dataset.dimensions.keys()
