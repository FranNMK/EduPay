class Students:
    #constructor
    def __init__(self, name, score):
        self.name = name
        self.score = score
    # method
    def display_onfo(self):
        print("Name: {self.name} Score {self.score}")
    #method
    def has_passed(self):
        return self.score>50
    
# creATE OBJECT
stud1 = Students(name: "Erick", score: 89)
print("Passed", stud1.has_passed())