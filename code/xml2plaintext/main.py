import re, os
from models.XMLFile import XMLFile

files = [ f 
  for f in [
      os.path.join('..', '..', 'OpenLP Database', 'Songs', x)
      for x in os.listdir('../../OpenLP Database/Songs')
      if re.match(r'.*xml', x)
    ]
  if os.path.isfile(f)
]

xmls = [ XMLFile(f) for f in files ]
for x in xmls:
  x.write_plaintext()
