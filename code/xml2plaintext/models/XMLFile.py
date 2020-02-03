from xml.dom import minidom
import re, os

rewrite_map = {
  # Hungarian characters
    # Uppercase | Lowercase
      'Á': 'A',    'á': 'a',
      'É': 'E',    'é': 'e',
      'Ö': 'O',    'ö': 'o',
      'Ő': 'O',    'ő': 'o',
      'Õ': 'O',    'õ': 'o',
      'Ó': 'O',    'ó': 'o',
      'Ú': 'U',    'ú': 'u',
      'Ü': 'U',    'ü': 'u',
      'Ű': 'U',    'ű': 'u',
      'Í': 'I',    'í': 'i',
      'Û': 'U',    'û': 'u',
  # Romanian characters
    # Uppercase | Lowercase
      'Ă': 'A',    'ă': 'a',
      'Â': 'A',    'â': 'a',
      'Î': 'I',    'î': 'i',
      'Ț': 'T',    'ț': 't',
      'Ș': 'S',    'ș': 's',
  # Special / puntuation characters
    # Rewrite
      ' ': '_', '. ': '_', # Rewrite spaces (no escaping needed in terminal)
      '/': '_', # Prevent accidental path traversal
      # Cosmetic replacements
      '_-_':  '_', ' - ':  '_',
      '_->_': '_', ' -> ': '_',
      '__': '_', '_+_': '_', ' + ': '_',
    # Remove
      ',':  '',  '.':  '', # Standard punctuation characters
      ':':  '',  '!':  '', '?': '', # Problematic characters (Windows)
      # Other (potentially) problematic characters
      '\'': '',  '"':  '',
      '@':  '',  '\\': '',
      '#':  '',  '&':  '',
      '*':  '',  '%':  '',
      '^':  '',  '$':  '',
      '(':  '',  ')':  ''
  }

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

  def filter_title(self, title: str) -> str:
    filtered = title.strip()
    for to_replace in rewrite_map.keys():
      filtered = filtered.replace(to_replace, rewrite_map[to_replace])
    return filtered

  def write_plaintext(self):
    if not os.path.isdir('output'):
      os.mkdir('output')
    filename = f'output/{self.filter_title(self.title)}.txt'
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
