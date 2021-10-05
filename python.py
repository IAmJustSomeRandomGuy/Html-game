# importing the required module
import matplotlib.pyplot as plt
import math


z = [0,0,0,0,0]
x = []
y = [[],[],[],[],[]]
damage = 1
calculation = [0,0,0,0,0]
print_string = ""

for i in range(2, 150):
  damage = int((damage * 1.4) ** 0.97 + 1)
  y[0] += [damage]
  
  # print_string = str(i) + ")"
  
  # for n in range(5):
  #   calculation[n] = round(((n + 1) * i + 1) ** (1 + i ** 1.05 / i ** 1.1))
    
  #   # if (z[n] ==  calculation[n]):
  #   #   print(i)
  #   #   break
    
  #   z[n] = calculation[n]
    
  #   print_string += ", roll " + str(n + 1) + ": " + str(calculation[n])
    
  #   y[n] += [z[n]]
    
  x += [i]
  # print(print_string + " roll 5 is " + str(round(y[4][i-2]/y[0][i-2], 2)) + "x better")

# plotting the points 
# for y in y:
#   plt.plot(x, y)
plt.plot(x, y[0])

# naming the x axis
plt.xlabel('x - axis')
# naming the y axis
plt.ylabel('y - axis')

# giving a title to my graph
plt.title('')

# function to show the plot
plt.show()