# dummyyy not used here:
hour_angle = 360/12
min_angle = 360/60

def clock_angle(hour, minute):
    if hour == 12 and minute == 12:

        angle == 0
        return angle

    else:

        hour = hour # we need to keep it same (for demostration only)
        # min = 360/60 = 6
        minute_angle = 6 * minute
        # because for hour hm krte : 360/12 wILl return like 30 degrees
        hour_angle = 30 * hour + 0.5 * minute
        angle = abs(hour_angle - minute_angle)
        return angle

time_input = input("Enter time  in (HH:MM): ")
   #hours , min = map(int, time_input.split(":"))

h, m = map(int, time_input.split(":"))
print(f"Angle between hands at {time_input} is {clock_angle(h, m)} degrees.")
