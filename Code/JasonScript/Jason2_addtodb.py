################################################################################
#                                                                              #
# Jason2_addtodb.py: add processed result into Postgresql database.            #
#                                                                              #
#	user: vgs                                                              #
#	sudo -i -u vgs                                                         #
#	CREATE TABLE vgs_height (                                              #
#        	id serial primary key,                                         #
#        	location_id, integer, #start from 1, currently 15 total        #
#        	datafile, varchar(50),#Data file Name                          #
#        	height real,          #Water Elevation                         #
#        	lat real,             #Lat                                     #
#        	lon real,	      #Long                                    #
#        	bs  real,             #bs value from netcdf result             #
#        	datetime timestamp    #date/time                               #
#	)                                                                      #
#                                                                              #
#                                                                              #
#                                                                              #
#                                                                              #
# History:                                                                     #
#     2016-09-01 Written, Matt He, GHRC                                        #
#                                                                              #
#                                                                              #
################################################################################
import psycopg2,sys


if len(sys.argv) != 9 :
        print("USAGE: python Jason2_addtodb.py LOCATION_ID DATAFILE HEIGHT LAT LON BS TIMESTAMP\n")
        sys.exit(0)
location_id = int(sys.argv[1])
datafile = sys.argv[2]
height = float(sys.argv[3])
lon     = float(sys.argv[4])
lat  = float(sys.argv[5])
bs   = float(sys.argv[6])
datestr = sys.argv[7]
timestr  = sys.argv[8]
timestamp = datestr + " " + timestr

conn = None
try:
    conn = psycopg2.connect("dbname='vgs' user='vgs' host='localhost' password='servirvgs'")
#    conn = psycopg2.connect("dbname='vgs' user='vgs' host='localhost'")

    cur = conn.cursor()
#insert into vgs_height (location_id, datafile, height, lat, lon, bs, datetime) VALUES (15, 'JA2_GPN_2PdP292_001_20160605_121114_20160605_130727.nc', -6.996873, 103.617647, 10.214537,  13.114000, '2016-06-05 12:42:49.333390');
    cur.execute("INSERT INTO vgs_height (location_id, datafile, height, lat, lon, bs, datetime) VALUES (%d, '%s', %f, %f, %f, %f, '%s')"%(location_id, datafile, height, lat, lon , bs, timestamp))
    conn.commit()
except psycopg2.DatabaseError as e:
    print ("Unable to connect to the Database VGS")
    if conn:
        conn.rollback()
    print ("Error %s"% e)
    sys.exit(1)

finally:
    if conn:
#        print ("All Done");
        conn.close()

