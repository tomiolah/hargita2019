from xml.dom import minidom
import re

class XMLFile:
  def __init__(self, path: str):
    with open(path, 'r') as fl:
      self.str_content = ''.join([ i.strip() for i in fl.readlines() ])
      self.__parse__()

  def __parse__(self):
    xml_dom = minidom.parseString(self.str_content)
    self.title = xml_dom.getElementsByTagName('title')[0].childNodes[0].nodeValue
    self.order = []
    if xml_dom.getElementsByTagName('verseOrder'):
      self.order = xml_dom.getElementsByTagName('verseOrder')[0].childNodes[0].nodeValue.split(' ')
    self.verses = {
      i.attributes['name'].value: '\n'.join([ x.nodeValue for x in i.childNodes[0].childNodes if x.nodeValue ])
      for i in xml_dom.getElementsByTagName('verse')
    }

  def write_plaintext(self):
    filename = f'''output/{
      self.title.replace(" ", "_")
      .replace("/", "_")
      .replace(",","")
      .replace(".","")
    }.txt'''
    print(filename)
    with open(filename, 'w') as f:
      f.writelines(self.title)
      f.writelines('\n')
      f.writelines('\n')
      if len(self.order) > 0:
        for o in self.order:
          for v in [ x for x in self.verses.keys() if re.match(fr'{o}.*', x) ]:
            f.writelines(v)
            f.writelines('\n')
            f.writelines(self.verses[v])
            f.writelines('\n')
            f.writelines('\n')
      else:
        for k in self.verses.keys():
          f.writelines(k)
          f.writelines('\n')
          f.writelines(self.verses[k])
          f.writelines('\n')
          f.writelines('\n')
