from os import popen
import re
from models.XMLFile import XMLFile

with popen('find ../../OpenLP\\ Database/Songs') as ls:
  files = [ _.strip() for _ in ls.readlines()[1:] if re.match(r'.*xml', _)  ]
xmls = [ XMLFile(f) for f in files ]
for x in xmls:
  x.write_plaintext()
