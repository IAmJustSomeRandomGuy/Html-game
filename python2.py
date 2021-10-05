import math
roll = 5
wave = 30
for wave in range(1, 50):
  # print(wave - 1, round((roll * wave + 1) ** (1 + wave ** 1.05 / wave ** 1.1)))
  print(wave, round((10 * wave * 1.05) ** (1 + wave / 20) * 1.2), round((10 * wave * 1.2) ** (1 + wave / 20)))