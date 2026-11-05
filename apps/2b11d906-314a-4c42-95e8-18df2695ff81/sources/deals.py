import pandas as pd
import io

csv_text = """region,rep,stage,amount,close_month
East,Alice,Closed Won,35347.49,2025-10
West,Dave,Proposal,4565.39,2025-06
North,Eve,Prospecting,41271.14,2025-03
East,Dave,Closed Won,35605.87,2025-03
East,Frank,Prospecting,4986.09,2025-09
West,Eve,Closed Lost,5157.05,2025-07
North,Eve,Closed Lost,49345.34,2025-05
North,Carol,Closed Lost,19339.27,2025-12
East,Eve,Proposal,19161.47,2025-10
South,Dave,Prospecting,40827.18,2025-07
East,Eve,Closed Lost,47415.18,2025-09
East,Carol,Negotiation,49314.05,2025-01
East,Carol,Closed Lost,37915.53,2025-07
East,Frank,Closed Lost,19436.72,2025-06
West,Dave,Closed Lost,5091.54,2025-10
North,Bob,Proposal,39080.2,2025-12
West,Bob,Proposal,28361.81,2025-09
West,Eve,Closed Lost,21786.88,2025-01
West,Frank,Proposal,45411.36,2025-04
East,Alice,Prospecting,6448.68,2025-09
South,Eve,Closed Won,25138.63,2025-04
North,Frank,Closed Lost,1556.33,2025-10
South,Dave,Closed Won,23964.37,2025-03
West,Dave,Closed Won,3758.86,2025-09
West,Dave,Prospecting,6822.08,2025-02
South,Dave,Closed Won,6758.79,2025-04
South,Dave,Closed Lost,32811.3,2025-06
South,Frank,Prospecting,37556.2,2025-02
West,Frank,Negotiation,29585.07,2025-08
West,Carol,Closed Lost,48146.45,2025-08
North,Bob,Closed Won,19368.66,2025-01
North,Dave,Closed Won,14999.89,2025-12
West,Alice,Closed Won,43561.36,2025-03
South,Frank,Proposal,11956.2,2025-10
South,Alice,Proposal,48197.9,2025-09
North,Alice,Closed Won,1595.57,2025-05
West,Alice,Closed Won,48524.06,2025-06
North,Carol,Closed Lost,3114.84,2025-04
North,Frank,Closed Lost,44666.01,2025-10
East,Alice,Negotiation,26857.35,2025-02
East,Dave,Negotiation,49655.28,2025-11
East,Eve,Closed Won,4616.03,2025-08
South,Alice,Closed Won,28138.86,2025-11
West,Carol,Closed Won,48495.82,2025-06
West,Frank,Closed Won,26631.79,2025-05
West,Carol,Closed Lost,31840.53,2025-09
West,Alice,Proposal,35091.69,2025-01
East,Frank,Proposal,23272.51,2025-05
South,Eve,Prospecting,31750.35,2025-06
South,Alice,Closed Won,29631.4,2025-05
East,Carol,Prospecting,45156.74,2025-06
South,Bob,Negotiation,3226.87,2025-06
East,Dave,Negotiation,14767.2,2025-07
West,Carol,Proposal,47570.16,2025-04
East,Frank,Closed Won,44622.93,2025-11
West,Alice,Prospecting,23327.18,2025-08
West,Dave,Prospecting,31386.5,2025-07
North,Alice,Closed Won,14591.68,2025-09
East,Frank,Proposal,10217.94,2025-07
North,Alice,Prospecting,23721.22,2025-03
East,Bob,Negotiation,18314.26,2025-03
East,Dave,Closed Won,29599.15,2025-08
North,Dave,Proposal,4809.0,2025-05
North,Frank,Closed Won,48745.35,2025-04
East,Bob,Prospecting,49324.33,2025-08
South,Carol,Prospecting,35209.92,2025-06
West,Alice,Negotiation,27268.72,2025-02
North,Eve,Negotiation,16166.85,2025-04
West,Alice,Closed Won,40875.96,2025-12
South,Alice,Closed Won,34551.83,2025-11
South,Carol,Closed Lost,8968.23,2025-04
South,Alice,Negotiation,45635.43,2025-06
North,Bob,Proposal,41304.32,2025-06
South,Bob,Closed Won,47540.2,2025-01
North,Dave,Proposal,36560.26,2025-08
South,Frank,Negotiation,31057.34,2025-06
West,Eve,Prospecting,21493.91,2025-03
West,Alice,Prospecting,46703.7,2025-09
East,Alice,Closed Lost,43437.13,2025-02
West,Carol,Closed Won,3215.71,2025-11
East,Frank,Closed Won,2291.98,2025-08
West,Bob,Negotiation,19446.7,2025-10
North,Eve,Prospecting,40717.11,2025-03
West,Dave,Prospecting,49376.53,2025-12
East,Bob,Proposal,8370.43,2025-05
East,Frank,Negotiation,30112.41,2025-06
South,Dave,Closed Won,19663.65,2025-10
North,Carol,Closed Won,48525.81,2025-06
West,Carol,Proposal,42263.83,2025-04
South,Alice,Closed Lost,42078.11,2025-03
West,Frank,Closed Won,23965.96,2025-04
West,Eve,Closed Won,21326.16,2025-01
South,Dave,Closed Won,14396.95,2025-04
South,Bob,Negotiation,3762.4,2025-01
South,Frank,Proposal,43371.4,2025-12
South,Frank,Proposal,40832.15,2025-01
South,Carol,Closed Won,49986.17,2025-10
West,Alice,Prospecting,49835.21,2025-06
South,Alice,Prospecting,28216.15,2025-05
North,Dave,Prospecting,38680.38,2025-11
East,Carol,Prospecting,47293.52,2025-04
South,Frank,Closed Lost,42632.72,2025-11
South,Eve,Closed Won,13120.06,2025-03
West,Carol,Negotiation,23076.66,2025-01
South,Dave,Prospecting,7328.81,2025-06
South,Dave,Negotiation,47748.5,2025-02
South,Carol,Negotiation,30702.56,2025-08
West,Dave,Prospecting,12203.5,2025-10
South,Carol,Negotiation,33913.33,2025-05
East,Bob,Proposal,31288.28,2025-07
West,Carol,Closed Won,18549.97,2025-10
East,Carol,Closed Won,6564.32,2025-12
West,Dave,Prospecting,33907.09,2025-02
South,Dave,Proposal,26495.08,2025-08
East,Alice,Closed Won,38843.6,2025-02
West,Alice,Negotiation,26488.01,2025-04
North,Bob,Closed Lost,42756.89,2025-01
South,Alice,Closed Won,28043.44,2025-05
West,Carol,Prospecting,28485.96,2025-09
North,Dave,Prospecting,43956.03,2025-01
West,Alice,Closed Won,20770.66,2025-09
North,Alice,Prospecting,7566.75,2025-11
South,Bob,Closed Won,2410.35,2025-08
East,Frank,Closed Lost,38001.73,2025-06
North,Bob,Closed Won,31395.17,2025-07
West,Carol,Proposal,35499.91,2025-03
South,Dave,Closed Won,11435.24,2025-01
North,Bob,Negotiation,7682.2,2025-05
West,Alice,Negotiation,1712.69,2025-12
West,Dave,Closed Lost,18178.79,2025-12
West,Dave,Proposal,29905.97,2025-02
North,Alice,Closed Lost,20219.96,2025-05
North,Bob,Closed Lost,22436.27,2025-08
North,Alice,Prospecting,45303.78,2025-11
East,Frank,Prospecting,18064.52,2025-09
North,Dave,Prospecting,26185.48,2025-02
North,Eve,Prospecting,39399.0,2025-12
North,Eve,Prospecting,20430.6,2025-03
East,Carol,Closed Won,31482.25,2025-03
North,Alice,Prospecting,43255.82,2025-01
West,Alice,Proposal,47526.51,2025-08
North,Carol,Closed Won,8206.6,2025-06
West,Carol,Prospecting,46402.79,2025-12
West,Carol,Closed Won,25113.7,2025-08
West,Dave,Proposal,13653.98,2025-11
East,Frank,Prospecting,23497.65,2025-09
East,Alice,Closed Won,49021.6,2025-05
East,Dave,Closed Won,25138.29,2025-12
North,Carol,Closed Lost,17108.83,2025-03
West,Alice,Closed Won,32036.64,2025-05
East,Dave,Closed Won,12767.14,2025-05
East,Frank,Proposal,4717.3,2025-05
North,Dave,Prospecting,7315.11,2025-03
East,Frank,Closed Won,7274.25,2025-11
North,Carol,Closed Won,8443.23,2025-10
South,Frank,Closed Lost,7802.53,2025-04
East,Alice,Negotiation,32402.86,2025-09
South,Carol,Proposal,9912.12,2025-10
North,Alice,Closed Won,17937.7,2025-09
West,Eve,Proposal,44942.63,2025-02
East,Bob,Closed Lost,24224.12,2025-08
North,Frank,Closed Lost,33710.33,2025-08
West,Bob,Negotiation,9443.67,2025-07
West,Bob,Closed Won,10422.16,2025-08
South,Frank,Closed Won,3002.56,2025-03
North,Carol,Prospecting,9277.82,2025-06
West,Eve,Closed Lost,14650.93,2025-01
East,Alice,Negotiation,9673.51,2025-07
East,Dave,Closed Won,5346.42,2025-01
South,Alice,Proposal,6911.16,2025-09
West,Dave,Closed Lost,23578.16,2025-01
North,Alice,Proposal,11110.35,2025-01
East,Frank,Prospecting,18849.22,2025-07
West,Eve,Closed Lost,25667.45,2025-02
West,Dave,Prospecting,34829.35,2025-05
South,Carol,Proposal,2926.29,2025-08
East,Alice,Closed Lost,40171.11,2025-08
East,Alice,Closed Lost,31767.12,2025-03
North,Dave,Closed Won,5006.19,2025-07
East,Carol,Closed Won,43805.35,2025-03
North,Carol,Negotiation,46122.75,2025-06
East,Frank,Proposal,3992.82,2025-06
South,Frank,Proposal,14567.0,2025-03
East,Frank,Closed Won,40503.86,2025-07
North,Frank,Closed Won,37664.72,2025-03
North,Frank,Closed Won,10041.53,2025-08
South,Frank,Closed Won,11258.12,2025-10
East,Eve,Prospecting,19153.13,2025-04
East,Carol,Negotiation,24741.63,2025-01
South,Frank,Prospecting,31294.48,2025-04
East,Carol,Negotiation,19076.77,2025-07
East,Carol,Negotiation,23664.2,2025-11
North,Bob,Closed Lost,37626.08,2025-04
East,Eve,Proposal,2797.48,2025-06
East,Frank,Prospecting,13369.41,2025-09
South,Alice,Prospecting,35954.13,2025-01
South,Dave,Closed Won,44865.14,2025-05
West,Alice,Closed Won,26072.19,2025-11
North,Eve,Prospecting,27073.56,2025-07
East,Dave,Prospecting,6251.43,2025-01
"""

deals = pd.read_csv(io.StringIO(csv_text))
