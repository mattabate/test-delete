import pandas as pd
import io

csv_text = '''region,rep,stage,amount,close_month
EMEA,Rep 8,Closed Won,16316.04,2026-03
LATAM,Rep 4,Closed Lost,11444.43,2026-04
APAC,Rep 11,Negotiation,1657.55,2026-04
EMEA,Rep 1,Closed Won,11373.51,2026-04
North America,Rep 8,Proposal,9791.33,2026-04
North America,Rep 4,Proposal,22826.91,2026-05
North America,Rep 6,Closed Won,9528.52,2026-05
LATAM,Rep 8,Closed Won,61301.2,2026-02
EMEA,Rep 4,Proposal,30886.55,2026-01
APAC,Rep 3,Closed Lost,10572.95,2026-04
North America,Rep 9,Closed Lost,26629.47,2026-02
LATAM,Rep 3,Negotiation,18308.62,2026-01
APAC,Rep 9,Negotiation,15368.57,2026-06
North America,Rep 2,Proposal,21624.7,2026-03
North America,Rep 2,Proposal,13800.26,2026-05
North America,Rep 2,Proposal,15432.19,2026-06
North America,Rep 6,Negotiation,21894.95,2026-01
EMEA,Rep 3,Proposal,45774.01,2026-06
EMEA,Rep 9,Negotiation,15532.92,2026-03
North America,Rep 4,Closed Lost,10175.34,2026-01
EMEA,Rep 1,Closed Won,3953.91,2026-06
North America,Rep 4,Proposal,43337.87,2026-05
North America,Rep 1,Proposal,11407.83,2026-05
EMEA,Rep 5,Negotiation,18414.35,2026-02
EMEA,Rep 4,Proposal,41921.09,2026-06
APAC,Rep 8,Negotiation,15314.59,2026-04
North America,Rep 8,Closed Won,11886.97,2026-06
EMEA,Rep 7,Closed Won,31313.47,2026-01
EMEA,Rep 3,Closed Won,17613.88,2026-01
North America,Rep 1,Closed Lost,18989.92,2026-06
EMEA,Rep 1,Closed Won,5356.7,2026-03
North America,Rep 12,Negotiation,27544.25,2026-05
North America,Rep 11,Closed Won,16736.59,2026-01
LATAM,Rep 3,Negotiation,5866.69,2026-05
LATAM,Rep 6,Closed Lost,17873.18,2026-01
APAC,Rep 7,Negotiation,3875.71,2026-02
North America,Rep 6,Closed Won,54458.0,2026-04
North America,Rep 6,Closed Won,6897.31,2026-01
APAC,Rep 6,Closed Lost,35139.31,2026-05
EMEA,Rep 3,Negotiation,8202.77,2026-02
North America,Rep 6,Closed Won,18697.32,2026-01
EMEA,Rep 8,Proposal,7728.91,2026-03
North America,Rep 11,Closed Won,24300.91,2026-04
LATAM,Rep 11,Closed Lost,11600.56,2026-01
North America,Rep 2,Proposal,17688.46,2026-02
APAC,Rep 5,Closed Lost,13481.03,2026-03
North America,Rep 1,Closed Lost,5887.58,2026-06
EMEA,Rep 12,Closed Lost,18078.24,2026-02
EMEA,Rep 1,Closed Lost,9877.92,2026-02
North America,Rep 5,Negotiation,25013.92,2026-03
LATAM,Rep 12,Closed Won,11596.8,2026-02
APAC,Rep 3,Closed Won,12758.36,2026-03
LATAM,Rep 4,Closed Lost,36671.53,2026-01
LATAM,Rep 3,Proposal,55769.48,2026-03
EMEA,Rep 1,Closed Lost,21410.15,2026-03
LATAM,Rep 1,Closed Won,11245.42,2026-04
North America,Rep 12,Negotiation,10670.13,2026-03
North America,Rep 12,Negotiation,8174.66,2026-03
North America,Rep 5,Closed Won,9180.68,2026-06
North America,Rep 6,Closed Lost,11337.08,2026-01
EMEA,Rep 3,Closed Lost,43414.63,2026-04
North America,Rep 12,Closed Lost,11868.78,2026-06
APAC,Rep 9,Closed Lost,6402.02,2026-05
EMEA,Rep 5,Closed Won,13697.92,2026-01
North America,Rep 8,Closed Won,14866.67,2026-01
EMEA,Rep 1,Closed Won,13648.45,2026-05
North America,Rep 5,Proposal,21586.31,2026-03
APAC,Rep 3,Proposal,13924.47,2026-06
North America,Rep 12,Closed Lost,21188.98,2026-02
LATAM,Rep 1,Proposal,8364.85,2026-04
APAC,Rep 4,Negotiation,38887.87,2026-02
North America,Rep 5,Closed Lost,15544.9,2026-05
North America,Rep 7,Closed Lost,16985.77,2026-01
APAC,Rep 1,Closed Won,8343.96,2026-01
APAC,Rep 3,Closed Won,17731.47,2026-04
APAC,Rep 2,Negotiation,19744.67,2026-01
APAC,Rep 9,Closed Lost,6621.91,2026-01
North America,Rep 10,Closed Won,4937.16,2026-04
EMEA,Rep 6,Proposal,15933.83,2026-06
North America,Rep 10,Negotiation,9964.04,2026-06
LATAM,Rep 3,Closed Won,15614.46,2026-04
EMEA,Rep 8,Proposal,6157.21,2026-05
North America,Rep 8,Proposal,5238.01,2026-01
North America,Rep 2,Proposal,15123.63,2026-01
North America,Rep 6,Closed Won,10830.59,2026-05
North America,Rep 7,Negotiation,3765.29,2026-06
APAC,Rep 2,Closed Lost,29907.34,2026-03
EMEA,Rep 11,Negotiation,6096.11,2026-03
LATAM,Rep 10,Proposal,62567.11,2026-03
EMEA,Rep 2,Negotiation,9187.42,2026-06
North America,Rep 10,Proposal,16999.45,2026-06
APAC,Rep 1,Proposal,35888.4,2026-05
APAC,Rep 8,Proposal,32456.64,2026-01
EMEA,Rep 1,Closed Lost,43988.43,2026-05
APAC,Rep 9,Closed Won,5356.97,2026-05
EMEA,Rep 11,Closed Lost,6757.99,2026-06
EMEA,Rep 6,Proposal,15299.85,2026-03
EMEA,Rep 7,Closed Won,22111.4,2026-02
North America,Rep 10,Closed Lost,13270.03,2026-01
North America,Rep 7,Closed Won,5000.05,2026-06
North America,Rep 10,Closed Lost,17996.76,2026-03
EMEA,Rep 3,Proposal,11889.95,2026-02
North America,Rep 2,Proposal,11804.74,2026-02
EMEA,Rep 9,Closed Won,3405.78,2026-06
LATAM,Rep 8,Proposal,21557.75,2026-04
North America,Rep 12,Closed Lost,14575.87,2026-01
EMEA,Rep 10,Closed Lost,39226.14,2026-02
APAC,Rep 7,Negotiation,12775.64,2026-06
North America,Rep 9,Closed Lost,18766.04,2026-06
North America,Rep 4,Closed Lost,22006.45,2026-03
North America,Rep 4,Negotiation,4685.85,2026-04
North America,Rep 1,Closed Won,64216.79,2026-01
LATAM,Rep 8,Closed Won,10316.76,2026-05
APAC,Rep 12,Closed Lost,17975.05,2026-03
EMEA,Rep 3,Closed Won,19620.87,2026-02
LATAM,Rep 7,Closed Lost,8193.77,2026-02
APAC,Rep 12,Closed Lost,40464.82,2026-03
North America,Rep 2,Negotiation,15671.09,2026-06
LATAM,Rep 2,Negotiation,11753.62,2026-02
EMEA,Rep 7,Proposal,14517.42,2026-04
APAC,Rep 6,Negotiation,21132.16,2026-01
LATAM,Rep 3,Negotiation,13446.56,2026-04
North America,Rep 9,Closed Won,22678.17,2026-02
North America,Rep 10,Closed Lost,4861.38,2026-05
North America,Rep 6,Closed Lost,8528.92,2026-01
EMEA,Rep 10,Closed Won,3702.34,2026-01
APAC,Rep 10,Closed Lost,44276.3,2026-03
LATAM,Rep 6,Closed Lost,43931.87,2026-03
North America,Rep 1,Proposal,19457.15,2026-05
EMEA,Rep 4,Proposal,7276.67,2026-06
EMEA,Rep 10,Closed Lost,56045.94,2026-01
North America,Rep 6,Closed Won,9296.11,2026-05
North America,Rep 6,Closed Won,11755.49,2026-03
North America,Rep 11,Proposal,14701.72,2026-03
LATAM,Rep 12,Proposal,17516.69,2026-01
North America,Rep 5,Closed Won,19658.82,2026-04
EMEA,Rep 1,Negotiation,20138.26,2026-02
APAC,Rep 8,Closed Won,12250.05,2026-03
EMEA,Rep 5,Closed Won,19947.53,2026-06
LATAM,Rep 12,Closed Won,11925.99,2026-06
LATAM,Rep 12,Closed Won,18912.57,2026-03
North America,Rep 12,Proposal,18004.47,2026-04
EMEA,Rep 5,Negotiation,21114.35,2026-04
North America,Rep 7,Closed Lost,19590.11,2026-05
North America,Rep 4,Negotiation,10244.95,2026-06
North America,Rep 6,Proposal,17592.47,2026-05
EMEA,Rep 4,Proposal,19772.35,2026-06
EMEA,Rep 3,Closed Won,6156.88,2026-02
North America,Rep 7,Closed Lost,11334.13,2026-02
North America,Rep 8,Closed Won,19242.34,2026-01
LATAM,Rep 4,Closed Won,37256.27,2026-05
North America,Rep 2,Closed Won,21915.3,2026-03
North America,Rep 12,Negotiation,38693.5,2026-05
EMEA,Rep 10,Closed Lost,10519.39,2026-03
LATAM,Rep 3,Closed Won,15523.56,2026-04
North America,Rep 1,Closed Won,21664.74,2026-05
APAC,Rep 8,Closed Lost,3308.3,2026-04
APAC,Rep 3,Closed Won,33073.31,2026-02
North America,Rep 12,Closed Lost,4374.09,2026-02
APAC,Rep 10,Closed Won,24298.36,2026-01
EMEA,Rep 7,Closed Won,20172.97,2026-05
EMEA,Rep 10,Closed Lost,3282.12,2026-04
EMEA,Rep 5,Negotiation,3383.15,2026-03
EMEA,Rep 10,Closed Won,31555.06,2026-02
North America,Rep 5,Closed Won,27690.18,2026-02
APAC,Rep 7,Closed Won,7875.26,2026-03
North America,Rep 9,Proposal,7870.47,2026-04
North America,Rep 12,Closed Lost,18170.65,2026-04
North America,Rep 5,Closed Lost,13257.96,2026-05
EMEA,Rep 1,Proposal,25150.6,2026-05
APAC,Rep 10,Closed Won,17814.15,2026-06
North America,Rep 10,Proposal,34538.1,2026-06
EMEA,Rep 1,Closed Lost,23909.87,2026-01
North America,Rep 2,Closed Won,20588.0,2026-02
EMEA,Rep 6,Closed Lost,10815.39,2026-05
North America,Rep 9,Negotiation,10350.68,2026-04
APAC,Rep 8,Closed Lost,12951.21,2026-03
EMEA,Rep 5,Proposal,40318.51,2026-04
LATAM,Rep 1,Closed Lost,10469.64,2026-02
North America,Rep 7,Negotiation,15620.16,2026-06
North America,Rep 5,Closed Lost,3474.2,2026-04
North America,Rep 6,Proposal,20039.99,2026-01
LATAM,Rep 7,Closed Lost,51757.21,2026-02
LATAM,Rep 3,Closed Won,7629.8,2026-06
North America,Rep 12,Closed Won,89739.41,2026-03
APAC,Rep 10,Closed Won,14903.4,2026-06
APAC,Rep 3,Closed Won,2853.33,2026-01
EMEA,Rep 5,Closed Won,10600.72,2026-02
EMEA,Rep 6,Negotiation,29681.02,2026-03
North America,Rep 9,Closed Lost,44337.69,2026-01
North America,Rep 12,Negotiation,20554.99,2026-06
LATAM,Rep 5,Proposal,34219.7,2026-01
LATAM,Rep 1,Closed Lost,6590.13,2026-02
EMEA,Rep 4,Negotiation,8882.54,2026-05
North America,Rep 5,Negotiation,4877.19,2026-01
North America,Rep 12,Closed Lost,9292.49,2026-01
APAC,Rep 10,Closed Won,21102.6,2026-06
LATAM,Rep 10,Closed Won,15177.87,2026-06
LATAM,Rep 5,Closed Won,22487.38,2026-03
APAC,Rep 7,Closed Won,7616.65,2026-06
'''

deals = pd.read_csv(io.StringIO(csv_text))
