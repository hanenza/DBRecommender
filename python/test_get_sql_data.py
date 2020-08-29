from unittest import TestCase
import sql_editor as sql

class TestGet_sql_data(TestCase):

    def test_get_sql_data(self):
        print("0")
        inp=[['class1', 'class2'], {'body': '', 'frequency': '', 'joinClass': ['class1', 'class2'], 'name': 'query1', 'queryType': 'select', 'selected': True}, {'name': 'query2', 'body': '', 'selected': True, 'queryType': '', 'joinClass': [], 'frequency': ''}]
        out={'data': [['class1', 'class2'], [0, 1], [1, 0]]}
        self.assertEqual(sql.get_sql_data(inp), out)
        inp=[['class1', 'class2', 'class3', 'class4', 'zz', 'class5'], {'name': 'query1', 'body': '', 'selected': True, 'queryType': 'select', 'joinClass': ['class1', 'class2'], 'frequency': ''}, {'name': 'query3', 'body': '', 'selected': True, 'queryType': 'insert', 'joinClass': ['class3'], 'frequency': ''}, {'name': 'query4', 'body': '', 'selected': True, 'queryType': 'delete', 'joinClass': ['class1', 'class2'], 'frequency': '17'}, {'name': 'query5', 'body': '', 'selected': True, 'queryType': 'connect', 'joinClass': ['class1', 'class2'], 'frequency': '17'}]
        out={'data': [['class1', 'class2', 'class3', 'class4', 'zz', 'class5'], [0, 3, 0, 0, 0, 0], [3, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]]}
        self.assertEqual(sql.get_sql_data(inp), out)
