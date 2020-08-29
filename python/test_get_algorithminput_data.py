from unittest import TestCase
import algorithm_input as algo

class TestGet_algorithminput_data(TestCase):
    def test_get_algorithminput_data(self):
        inp1={'data': [['class1', 'class2', 'class3', 'class4', 'zz', 'class5'], [0, 1, 2, 0, 1, 0], [1, 0, 0, 1, 0, 0], [2, 0, 1, 0, 1, 0], [0, 1, 0, 0, 0, 2], [1, 0, 1, 0, 0, 0], [0, 0, 0, 2, 0, 1]]}
        inp2={'data': [['class1', 'class2', 'class3', 'class4', 'zz', 'class5'], [0, 3, 0, 0, 0, 0], [3, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]]}
        inp3={'data': [['class1', 'class2', 'class3', 'class4', 'class5', 'zz'], [1.0, 0.62, 0.88, 0.75, 0.75, 0.62], [0.62, 1.0, 0.5, 0.88, 0.62, 1.0], [0.88, 0.5, 1.0, 0.62, 0.62, 0.5], [0.75, 0.88, 0.62, 1.0, 0.5, 0.88], [0.75, 0.62, 0.62, 0.5, 1.0, 0.62], [0.62, 1.0, 0.5, 0.88, 0.62, 1.0]]}
        inp4=[40, 30, 30]
        out={'data': [['class1', 'class2', 'class3', 'class4', 'zz', 'class5'], [0.3, 0.69, 0.66, 0.23, 0.43, 0.19], [0.69, 0.3, 0.15, 0.46, 0.19, 0.3], [0.66, 0.15, 0.5, 0.19, 0.39, 0.15], [0.23, 0.46, 0.19, 0.3, 0.15, 0.66], [0.43, 0.19, 0.39, 0.15, 0.3, 0.19], [0.19, 0.3, 0.15, 0.66, 0.19, 0.5]]}
        self.assertEqual(algo.get_algorithminput_data(inp1,inp2,inp3,inp4), out)
