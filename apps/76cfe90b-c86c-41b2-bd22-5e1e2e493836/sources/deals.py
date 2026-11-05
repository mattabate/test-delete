import pandas as pd
import io

csv_text = """region,rep,stage,amount,close_month
East,Alice,Proposal,24408.03,2025-06
West,Dave,Closed Won,5061.67,2025-07
North,Eve,Negotiation,26890.14,2025-04
East,Dave,Closed Lost,22380.46,2025-11
East,Eve,Closed Won,40303.35,2025-08
West,Eve,Closed Lost,48917.13,2025-07
North,Carol,Closed Won,28244.25,2025-09
North,Eve,Negotiation,16811.63,2025-07
East,Dave,Closed Won,3126.64,2025-03
South,Eve,Closed Won,46307.52,2025-03
East,Carol,Negotiation,46036.67,2025-08
East,Carol,Closed Won,13396.52,2025-05
East,Dave,Closed Won,35075.15,2025-04
East,Bob,Closed Lost,4696.29,2025-08
West,Bob,Closed Won,9144.56,2025-06
North,Eve,Proposal,11623.65,2025-02
West,Alice,Closed Won,15430.2,2025-04
West,Eve,Closed Lost,49795.74,2025-12
West,Dave,Closed Lost,35149.33,2025-11
East,Dave,Negotiation,19825.89,2025-04
South,Dave,Closed Won,37117.93,2025-06
North,Dave,Closed Won,45847.46,2025-06
South,Dave,Proposal,47976.42,2025-01
West,Carol,Proposal,3835.33,2025-08
West,Bob,Proposal,20331.57,2025-06
South,Dave,Closed Won,6231.05,2025-03
South,Alice,Closed Won,17447.34,2025-09
South,Alice,Closed Won,9314.32,2025-02
West,Alice,Closed Lost,32695.57,2025-11
West,Alice,Closed Won,20025.15,2025-08
North,Carol,Proposal,12240.34,2025-10
North,Alice,Closed Won,14030.96,2025-03
West,Dave,Proposal,18656.91,2025-12
South,Eve,Closed Lost,13737.54,2025-05
South,Alice,Proposal,23208.8,2025-06
North,Carol,Closed Won,2583.48,2025-10
West,Carol,Closed Lost,14708.41,2025-06
North,Alice,Negotiation,21149.13,2025-04
North,Eve,Closed Won,30536.31,2025-03
East,Alice,Closed Won,14276.92,2025-04
East,Carol,Proposal,7526.07,2025-01
East,Bob,Negotiation,4733.82,2025-04
South,Dave,Closed Won,47086.06,2025-01
West,Carol,Closed Lost,21415.31,2025-12
West,Alice,Closed Lost,29476.97,2025-01
West,Dave,Negotiation,46039.65,2025-10
West,Alice,Closed Won,5054.67,2025-06
East,Alice,Closed Won,43956.41,2025-05
South,Bob,Closed Won,28027.81,2025-11
South,Dave,Closed Lost,9076.88,2025-04
East,Dave,Negotiation,21151.5,2025-11
South,Bob,Closed Won,39102.51,2025-03
East,Carol,Proposal,24538.13,2025-01
West,Alice,Closed Lost,49279.02,2025-06
East,Eve,Closed Won,19460.21,2025-02
West,Alice,Closed Won,37729.34,2025-08
West,Alice,Closed Won,20256.48,2025-10
North,Carol,Proposal,41629.05,2025-05
East,Alice,Negotiation,28884.99,2025-07
North,Bob,Closed Lost,4112.08,2025-10
East,Bob,Negotiation,2804.27,2025-12
East,Dave,Closed Lost,7558.75,2025-02
North,Eve,Negotiation,1669.93,2025-08
North,Alice,Closed Won,4692.59,2025-02
East,Alice,Closed Lost,34894.01,2025-04
South,Carol,Closed Won,27182.97,2025-01
West,Bob,Closed Won,37745.63,2025-05
North,Eve,Closed Won,45745.12,2025-09
West,Dave,Closed Won,29672.33,2025-01
South,Bob,Closed Won,36579.92,2025-09
South,Dave,Closed Won,38096.98,2025-11
South,Carol,Proposal,19514.68,2025-08
North,Carol,Closed Won,12813.16,2025-06
South,Alice,Closed Won,11047.22,2025-07
North,Eve,Negotiation,13320.68,2025-03
South,Dave,Proposal,14461.86,2025-01
West,Bob,Closed Won,11154.15,2025-05
West,Carol,Closed Lost,44032.81,2025-12
East,Alice,Negotiation,38092.96,2025-12
West,Alice,Closed Won,3297.93,2025-02
East,Dave,Proposal,14164.95,2025-05
West,Carol,Proposal,2087.05,2025-08
North,Eve,Closed Won,25410.09,2025-11
West,Carol,Closed Won,24334.32,2025-09
East,Dave,Proposal,41737.2,2025-02
East,Dave,Closed Lost,16081.08,2025-12
South,Carol,Closed Lost,41002.9,2025-03
North,Dave,Negotiation,48430.71,2025-03
West,Carol,Negotiation,5332.0,2025-01
South,Bob,Proposal,39799.07,2025-08
West,Carol,Proposal,29907.84,2025-06
West,Carol,Proposal,24522.25,2025-12
South,Dave,Negotiation,21606.25,2025-08
South,Dave,Proposal,39448.74,2025-11
South,Alice,Negotiation,32328.71,2025-09
South,Alice,Closed Lost,40447.19,2025-05
South,Bob,Closed Won,45254.4,2025-12
West,Alice,Proposal,31245.92,2025-03
South,Carol,Proposal,49042.67,2025-05
North,Dave,Negotiation,30796.3,2025-05
East,Alice,Proposal,32195.57,2025-05
South,Alice,Negotiation,28185.96,2025-03
South,Bob,Closed Won,5459.1,2025-11
West,Bob,Closed Won,36593.45,2025-10
South,Carol,Closed Won,27824.87,2025-04
South,Dave,Closed Lost,23094.61,2025-09
South,Bob,Closed Won,45613.09,2025-10
West,Alice,Negotiation,15600.01,2025-09
South,Dave,Closed Won,26656.51,2025-02
East,Dave,Negotiation,35184.45,2025-08
West,Alice,Closed Lost,40027.12,2025-08
East,Bob,Negotiation,23507.99,2025-07
West,Alice,Closed Won,42262.48,2025-08
South,Dave,Closed Won,38676.97,2025-03
East,Eve,Closed Lost,4245.56,2025-06
West,Eve,Negotiation,3247.2,2025-01
North,Carol,Closed Won,31419.48,2025-07
South,Alice,Proposal,18023.26,2025-01
West,Alice,Closed Won,11247.41,2025-09
North,Carol,Closed Lost,29402.85,2025-01
West,Carol,Proposal,17736.6,2025-01
North,Carol,Closed Lost,27325.91,2025-07
South,Dave,Closed Lost,23545.84,2025-02
East,Alice,Closed Lost,29653.54,2025-05
North,Dave,Closed Lost,20614.72,2025-08
West,Carol,Negotiation,35185.71,2025-08
South,Alice,Closed Won,9823.3,2025-03
North,Dave,Closed Won,35128.57,2025-07
West,Dave,Closed Lost,21171.4,2025-03
West,Carol,Proposal,43841.56,2025-06
West,Alice,Closed Lost,26246.57,2025-06
North,Carol,Closed Won,48682.41,2025-03
North,Alice,Negotiation,30494.83,2025-07
North,Eve,Negotiation,11968.6,2025-03
East,Bob,Closed Won,41267.74,2025-08
North,Bob,Closed Lost,17909.05,2025-10
North,Bob,Closed Lost,18033.34,2025-04
North,Carol,Closed Lost,2558.43,2025-01
East,Eve,Closed Lost,27887.05,2025-04
North,Alice,Closed Won,27186.75,2025-07
West,Dave,Closed Won,18443.58,2025-11
North,Alice,Closed Won,44816.65,2025-04
West,Dave,Proposal,7308.67,2025-06
West,Alice,Proposal,17174.88,2025-09
West,Eve,Closed Lost,16757.56,2025-01
East,Dave,Proposal,5522.24,2025-05
East,Carol,Negotiation,24576.12,2025-11
East,Alice,Closed Lost,34701.45,2025-07
North,Alice,Closed Lost,26071.19,2025-01
West,Dave,Closed Won,8691.91,2025-04
East,Carol,Closed Won,19487.01,2025-06
East,Carol,Negotiation,1127.16,2025-02
North,Eve,Closed Lost,43546.75,2025-10
East,Carol,Closed Won,5141.33,2025-05
North,Carol,Proposal,30266.63,2025-11
South,Carol,Negotiation,49326.59,2025-10
East,Bob,Closed Won,27292.94,2025-01
South,Eve,Proposal,46278.05,2025-06
North,Alice,Proposal,12569.71,2025-06
West,Dave,Proposal,38237.82,2025-04
East,Alice,Closed Won,27032.02,2025-08
North,Eve,Negotiation,36305.29,2025-04
West,Dave,Closed Lost,4054.73,2025-08
West,Eve,Negotiation,8239.22,2025-08
South,Carol,Proposal,7522.73,2025-05
North,Dave,Negotiation,34671.11,2025-04
West,Carol,Proposal,42377.59,2025-12
East,Alice,Proposal,37731.2,2025-02
East,Alice,Proposal,2493.14,2025-11
South,Dave,Closed Lost,43493.53,2025-03
West,Dave,Closed Won,18353.19,2025-03
North,Eve,Closed Lost,20461.03,2025-04
East,Eve,Proposal,6138.59,2025-04
West,Carol,Closed Won,37132.86,2025-10
West,Dave,Closed Lost,9931.91,2025-11
South,Alice,Closed Won,28634.29,2025-11
East,Eve,Closed Lost,42194.79,2025-05
East,Eve,Proposal,5371.01,2025-04
North,Alice,Proposal,27231.44,2025-11
East,Eve,Closed Won,12427.6,2025-10
North,Carol,Proposal,17803.42,2025-08
East,Dave,Closed Lost,24224.53,2025-06
South,Alice,Closed Lost,18400.11,2025-06
East,Dave,Negotiation,32792.32,2025-08
North,Eve,Closed Lost,24499.52,2025-07
North,Eve,Closed Lost,29625.77,2025-10
South,Alice,Negotiation,37104.3,2025-11
East,Carol,Closed Won,28329.37,2025-12
East,Bob,Closed Won,29740.24,2025-10
South,Alice,Closed Lost,28658.47,2025-08
East,Bob,Closed Won,19559.86,2025-02
East,Bob,Closed Lost,17534.89,2025-09
North,Carol,Closed Lost,45082.72,2025-01
East,Bob,Negotiation,30770.21,2025-08
East,Bob,Negotiation,12973.3,2025-12
South,Carol,Proposal,25414.14,2025-11
South,Bob,Negotiation,17187.08,2025-12
West,Bob,Negotiation,46750.9,2025-12
North,Bob,Closed Won,1369.18,2025-04
East,Alice,Closed Lost,12041.31,2025-04
"""

deals = pd.read_csv(io.StringIO(csv_text))
