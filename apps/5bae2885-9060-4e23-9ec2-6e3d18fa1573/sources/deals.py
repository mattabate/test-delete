import pandas as pd
import io
csv_text = '''region,rep,stage,amount,close_month
East,Alice,Negotiation,35347.49,2026-10
West,Dave,Closed Won,4565.39,2026-06
North,Eve,Closed Won,41271.14,2026-03
East,Dave,Negotiation,35605.87,2026-03
East,Frank,Closed Won,4986.09,2026-09
West,Eve,Proposal,5157.05,2026-07
North,Eve,Proposal,49345.34,2026-05
North,Carol,Proposal,19339.27,2026-12
East,Eve,Closed Lost,19161.47,2026-10
South,Dave,Closed Won,40827.18,2026-07
East,Eve,Proposal,47415.18,2026-09
East,Carol,Closed Lost,49314.05,2026-01
East,Carol,Proposal,37915.53,2026-07
East,Frank,Proposal,19436.72,2026-06
West,Dave,Proposal,5091.54,2026-10
North,Bob,Closed Won,39080.2,2026-12
West,Bob,Closed Lost,28361.81,2026-09
West,Eve,Proposal,21786.88,2026-01
West,Frank,Closed Won,45411.36,2026-04
East,Alice,Closed Won,6448.68,2026-09
South,Eve,Closed Lost,25138.63,2026-04
North,Frank,Proposal,1556.33,2026-10
South,Dave,Negotiation,23964.37,2026-03
West,Dave,Closed Lost,3758.86,2026-09
West,Dave,Closed Won,6822.08,2026-02
South,Dave,Negotiation,6758.79,2026-04
South,Dave,Proposal,32811.3,2026-06
South,Frank,Closed Won,37556.2,2026-02
West,Frank,Closed Lost,29585.07,2026-08
West,Carol,Proposal,48146.45,2026-08
North,Bob,Negotiation,19368.66,2026-01
North,Dave,Negotiation,14999.89,2026-12
West,Alice,Negotiation,43561.36,2026-03
South,Frank,Closed Lost,11956.2,2026-10
South,Alice,Closed Won,48197.9,2026-09
North,Alice,Proposal,1595.57,2026-05
West,Alice,Proposal,48524.06,2026-06
North,Carol,Proposal,3114.84,2026-04
North,Frank,Proposal,44666.01,2026-10
East,Alice,Closed Lost,26857.35,2026-02
East,Dave,Closed Lost,49655.28,2026-11
East,Eve,Negotiation,4616.03,2026-08
South,Alice,Negotiation,28138.86,2026-11
West,Carol,Negotiation,48495.82,2026-06
West,Frank,Negotiation,26631.79,2026-05
West,Carol,Proposal,31840.53,2026-09
West,Alice,Closed Won,35091.69,2026-01
East,Frank,Closed Lost,23272.51,2026-05
South,Eve,Closed Won,31750.35,2026-06
South,Alice,Closed Lost,29631.4,2026-05
East,Carol,Closed Won,45156.74,2026-06
South,Bob,Closed Lost,3226.87,2026-06
East,Dave,Closed Lost,14767.2,2026-07
West,Carol,Closed Won,47570.16,2026-04
East,Frank,Closed Lost,44622.93,2026-11
West,Alice,Closed Won,23327.18,2026-08
West,Dave,Closed Won,31386.5,2026-07
North,Alice,Proposal,14591.68,2026-09
East,Frank,Closed Lost,10217.94,2026-07
North,Alice,Closed Won,23721.22,2026-03
East,Bob,Closed Lost,18314.26,2026-03
East,Dave,Negotiation,29599.15,2026-08
North,Dave,Closed Won,4809.0,2026-05
North,Frank,Negotiation,48745.35,2026-04
East,Bob,Closed Won,49324.33,2026-08
South,Carol,Closed Won,35209.92,2026-06
West,Alice,Closed Lost,27268.72,2026-02
North,Eve,Closed Lost,16166.85,2026-04
West,Alice,Negotiation,40875.96,2026-12
South,Alice,Negotiation,34551.83,2026-11
South,Carol,Proposal,8968.23,2026-04
South,Alice,Closed Lost,45635.43,2026-06
North,Bob,Closed Won,41304.32,2026-06
South,Bob,Negotiation,47540.2,2026-01
North,Dave,Closed Won,36560.26,2026-08
South,Frank,Closed Lost,31057.34,2026-06
West,Eve,Closed Won,21493.91,2026-03
West,Alice,Closed Won,46703.7,2026-09
East,Alice,Proposal,43437.13,2026-02
West,Carol,Proposal,3215.71,2026-11
East,Frank,Negotiation,2291.98,2026-08
West,Bob,Closed Lost,19446.7,2026-10
North,Eve,Closed Won,40717.11,2026-03
West,Dave,Closed Won,49376.53,2026-12
East,Bob,Closed Won,8370.43,2026-05
East,Frank,Closed Lost,30112.41,2026-06
South,Dave,Negotiation,19663.65,2026-10
North,Carol,Negotiation,48525.81,2026-06
West,Carol,Closed Won,42263.83,2026-04
South,Alice,Proposal,42078.11,2026-03
West,Frank,Negotiation,23965.96,2026-04
West,Eve,Closed Lost,21326.16,2026-01
South,Dave,Negotiation,14396.95,2026-04
South,Bob,Closed Lost,3762.4,2026-01
South,Frank,Closed Won,43371.4,2026-12
South,Frank,Closed Lost,40832.15,2026-01
South,Carol,Negotiation,49986.17,2026-10
West,Alice,Closed Won,49835.21,2026-06
South,Alice,Closed Won,28216.15,2026-05
North,Dave,Closed Won,38680.38,2026-11
East,Carol,Closed Won,47293.52,2026-04
South,Frank,Proposal,42632.72,2026-11
South,Eve,Negotiation,13120.06,2026-03
West,Carol,Closed Lost,23076.66,2026-01
South,Dave,Closed Won,7328.81,2026-06
South,Dave,Closed Lost,47748.5,2026-02
South,Carol,Closed Lost,30702.56,2026-08
West,Dave,Closed Won,12203.5,2026-10
South,Carol,Closed Lost,33913.33,2026-05
East,Bob,Closed Lost,31288.28,2026-07
West,Carol,Negotiation,18549.97,2026-10
East,Carol,Negotiation,6564.32,2026-12
West,Dave,Closed Won,33907.09,2026-02
South,Dave,Closed Lost,26495.08,2026-08
East,Alice,Negotiation,38843.6,2026-02
West,Alice,Closed Lost,26488.01,2026-04
North,Bob,Proposal,42756.89,2026-01
South,Alice,Negotiation,28043.44,2026-05
West,Carol,Closed Won,28485.96,2026-09
North,Dave,Closed Won,43956.03,2026-01
West,Alice,Negotiation,20770.66,2026-09
North,Alice,Closed Won,7566.75,2026-11
South,Bob,Closed Lost,2410.35,2026-08
East,Frank,Proposal,38001.73,2026-06
North,Bob,Closed Lost,31395.17,2026-07
West,Carol,Closed Lost,35499.91,2026-03
South,Dave,Negotiation,11435.24,2026-01
North,Bob,Closed Lost,7682.2,2026-05
West,Alice,Closed Lost,1712.69,2026-12
West,Dave,Proposal,18178.79,2026-12
West,Dave,Closed Lost,29905.97,2026-02
North,Alice,Proposal,20219.96,2026-05
North,Bob,Proposal,22436.27,2026-08
North,Alice,Closed Won,45303.78,2026-11
East,Frank,Closed Won,18064.52,2026-09
North,Dave,Closed Won,26185.48,2026-02
North,Eve,Closed Won,39399.0,2026-12
North,Eve,Closed Won,20430.6,2026-03
East,Carol,Negotiation,31482.25,2026-03
North,Alice,Closed Won,43255.82,2026-01
West,Alice,Closed Won,47526.51,2026-08
North,Carol,Proposal,8206.6,2026-06
West,Carol,Closed Won,46402.79,2026-12
West,Carol,Proposal,25113.7,2026-08
West,Dave,Closed Won,13653.98,2026-11
East,Frank,Closed Won,23497.65,2026-09
East,Alice,Negotiation,49021.6,2026-05
East,Dave,Negotiation,25138.29,2026-12
North,Carol,Proposal,17108.83,2026-03
West,Alice,Negotiation,32036.64,2026-05
East,Dave,Proposal,12767.14,2026-05
East,Frank,Closed Won,4717.3,2026-05
North,Dave,Closed Won,7315.11,2026-03
East,Frank,Negotiation,7274.25,2026-11
North,Carol,Proposal,8443.23,2026-10
South,Frank,Proposal,7802.53,2026-04
East,Alice,Closed Lost,32402.86,2026-09
South,Carol,Closed Lost,9912.12,2026-10
North,Alice,Negotiation,17937.7,2026-09
West,Eve,Closed Won,44942.63,2026-02
East,Bob,Proposal,24224.12,2026-08
North,Frank,Proposal,33710.33,2026-08
West,Bob,Closed Lost,9443.67,2026-07
West,Bob,Negotiation,10422.16,2026-08
South,Frank,Negotiation,3002.56,2026-03
North,Carol,Closed Won,9277.82,2026-06
West,Eve,Proposal,14650.93,2026-01
East,Alice,Closed Lost,9673.51,2026-07
East,Dave,Proposal,5346.42,2026-01
South,Alice,Closed Won,6911.16,2026-09
West,Dave,Proposal,23578.16,2026-01
North,Alice,Closed Lost,11110.35,2026-01
East,Frank,Closed Won,18849.22,2026-07
West,Eve,Proposal,25667.45,2026-02
West,Dave,Closed Won,34829.35,2026-05
South,Carol,Closed Won,2926.29,2026-08
East,Alice,Proposal,40171.11,2026-08
East,Alice,Proposal,31767.12,2026-03
North,Dave,Closed Lost,5006.19,2026-07
East,Carol,Negotiation,43805.35,2026-03
North,Carol,Closed Lost,46122.75,2026-06
East,Frank,Closed Won,3992.82,2026-06
South,Frank,Closed Won,14567.0,2026-03
East,Frank,Negotiation,40503.86,2026-07
North,Frank,Negotiation,37664.72,2026-03
North,Frank,Negotiation,10041.53,2026-08
South,Frank,Negotiation,11258.12,2026-10
East,Eve,Closed Won,19153.13,2026-04
East,Carol,Closed Lost,24741.63,2026-01
South,Frank,Closed Won,31294.48,2026-04
East,Carol,Closed Lost,19076.77,2026-07
East,Carol,Closed Lost,23664.2,2026-11
North,Bob,Proposal,37626.08,2026-04
East,Eve,Closed Lost,2797.48,2026-06
East,Frank,Closed Won,13369.41,2026-09
South,Alice,Closed Won,35954.13,2026-01
South,Dave,Negotiation,44865.14,2026-05
West,Alice,Negotiation,26072.19,2026-11
North,Eve,Closed Won,27073.56,2026-07
East,Dave,Closed Won,6251.43,2026-01
'''
deals = pd.read_csv(io.StringIO(csv_text))
