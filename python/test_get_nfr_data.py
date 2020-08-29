from unittest import TestCase
import nfr_editor as nfr

class TestGet_nfr_data(TestCase):
    def test_get_nfr_data(self):
        print("d")
        js = {'tableInfo': {'class1': {'a': 1, 'b': '2'}, 'class2': {'a': 2, 'b': '2'}}, 'defalutValue': {'a': {'legend': {'b': 1, 'c': 2}, 'type': 'Select Box', 'value': '0.5'}, 'b': {'max': 4, 'min': 1, 'step': 1, 'type': 'Range', 'value': '0.5'}}}
        rjs = {'data': [['class1', 'class2'], [1.0, 0.75], [0.75, 1.0]]}

        self.assertEqual(nfr.get_nfr_data(js), rjs)
        js = {'tableInfo': {}, 'defalutValue': {'a': {'legend': {'b': 1, 'c': 2}, 'type': 'Select Box', 'value': '0.5'}, 'b': {'max': 4, 'min': 1, 'step': 1, 'type': 'Range', 'value': '0.5'}}}
        rjs = {'data': [[]]}
        self.assertEqual(nfr.get_nfr_data(js), rjs)
        js ={'tableInfo': {'class1': {'a': 1, 'b': '3'}, 'class2': {'a': 2, 'b': '2'}, 'class3': {'a': 1, 'b': '2'}}, 'defalutValue': {'a': {'legend': {'b': 1, 'c': 2}, 'type': 'Select Box', 'value': '0.5'}, 'b': {'max': 4, 'min': 1, 'step': 1, 'type': 'Range', 'value': '0.5'}}}
        rjs = {'data': [['class1', 'class2', 'class3'], [1.0, 0.62, 0.88], [0.62, 1.0, 0.75], [0.88, 0.75, 1.0]]}
        self.assertEqual(nfr.get_nfr_data(js), rjs)
        js ={'tableInfo': {'class1': {'a': 1, 'b': '2'}, 'class2': {'a': 2, 'b': '3'}, 'class3': {'a': 1, 'b': '1'}, 'class4': {'key': 0, 'a': 2, 'b': '2'}, 'zz': {'key': 0, 'a': 2, 'b': '3'}, 'class5': {'key': 0, 'a': 1, 'b': '4'}}, 'defalutValue': {'a': {'legend': {'b': 1, 'c': 2}, 'type': 'Select Box', 'value': '0.5'}, 'b': {'max': 4, 'min': 1, 'step': 1, 'type': 'Range', 'value': '0.5'}}}
        rjs = {'data': [['class1', 'class2', 'class3', 'class4', 'zz', 'class5'], [1.0, 0.62, 0.88, 0.75, 0.62, 0.75], [0.62, 1.0, 0.5, 0.88, 1.0, 0.62], [0.88, 0.5, 1.0, 0.62, 0.5, 0.62], [0.75, 0.88, 0.62, 1.0, 0.88, 0.5], [0.62, 1.0, 0.5, 0.88, 1.0, 0.62], [0.75, 0.62, 0.62, 0.5, 0.62, 1.0]]}
        self.assertEqual(nfr.get_nfr_data(js), rjs)

    def test_getmaxnfr(self):
        print("g")
        inp={'legend': {'b': 1, 'c': 2}, 'type': 'Select Box', 'value': '0.5'}
        out=2
        self.assertEqual(nfr.getmaxnfr(inp), out)
        inp={'max': 4, 'min': 1, 'step': 1, 'type': 'Range', 'value': '0.5'}
        out=4
        self.assertEqual(nfr.getmaxnfr(inp), out)

    def test_buildarray(self):
        print("b")
        inp1={'class1': {'a': 1, 'b': '2'}, 'class2': {'a': 2, 'b': '2'}}
        inp2="a"
        out=[1.0, 2.0]
        self.assertEqual(nfr.buildarray(inp1,inp2), out)


    def test_buildmatrix(self):
        print("m")
        inp1=[1.0, 2.0]
        inp2=2
        out=[[1.0, 0.5], [0.5, 1.0]]
        self.assertEqual(nfr.buildmatrix(inp1, inp2), out)

    def test_buildTheLastMatrix(self):
        print("lll")
        inp1=[[[1.0, 0.5], [0.5, 1.0]], [[1.0, 1.0], [1.0, 1.0]]]
        inp2=['0.5', '0.5']
        inp3=2
        out=[[1.0, 0.75], [0.75, 1.0]]
        self.assertEqual(nfr.buildTheLastMatrix(inp1, inp2,inp3), out)


