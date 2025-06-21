import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk
import os

# Encryption/Decryption logic
def invert_image(img):
    return img.point(lambda p: 255 - p)

def swap_pixels(img):
    width, height = img.size
    pixels = img.load()

    for y in range(height):
        for x in range(width // 2):
            left_pixel = pixels[x, y]
            right_pixel = pixels[width - 1 - x, y]
            pixels[x, y], pixels[width - 1 - x, y] = right_pixel, left_pixel

    return img


# UI Functions
def load_image():
    file_path = filedialog.askopenfilename()
    if file_path:
        global original_img, display_img
        original_img = Image.open(file_path).convert("RGB")
        display_img = original_img.copy()
        show_image(display_img, canvas_input)

def show_image(img, canvas):
    img = img.resize((200, 200))
    tk_img = ImageTk.PhotoImage(img)
    canvas.img = tk_img
    canvas.create_image(0, 0, anchor='nw', image=tk_img)

def encrypt_image():
    if not display_img:
        messagebox.showerror("Error", "No image loaded.")
        return
    global processed_img
    processed_img = invert_image(display_img.copy())
    show_image(processed_img, canvas_output)

def swap_image_pixels():
    if not display_img:
        messagebox.showerror("Error", "No image loaded.")
        return
    global processed_img
    processed_img = swap_pixels(display_img.copy())
    show_image(processed_img, canvas_output)

def decrypt_image():
    if not processed_img:
        messagebox.showerror("Error", "No encrypted image.")
        return
    decrypted = invert_image(processed_img.copy())
    show_image(decrypted, canvas_output)

def save_image():
    if not processed_img:
        messagebox.showerror("Error", "No image to save.")
        return
    file = filedialog.asksaveasfilename(defaultextension=".png")
    if file:
        processed_img.save(file)
        messagebox.showinfo("Saved", "Image saved successfully!")

def clear():
    canvas_input.delete("all")
    canvas_output.delete("all")

def interchange():
    global display_img, processed_img
    display_img, processed_img = processed_img, display_img
    show_image(display_img, canvas_input)
    show_image(processed_img, canvas_output)

# Setup
root = tk.Tk()
root.title("Image Encryption Tool")
root.configure(bg="#f5f5dc") 

original_img = None
display_img = None
processed_img = None

tk.Label(root, text="Input Image", bg="#f5f5dc", font=("Arial", 12)).grid(row=0, column=0)
tk.Label(root, text="Output Image", bg="#f5f5dc", font=("Arial", 12)).grid(row=0, column=1)

canvas_input = tk.Canvas(root, width=200, height=200, bg="white")
canvas_input.grid(row=1, column=0, padx=10, pady=10)

canvas_output = tk.Canvas(root, width=200, height=200, bg="white")
canvas_output.grid(row=1, column=1, padx=10, pady=10)

button_frame = tk.Frame(root, bg="#f5f5dc")
button_frame.grid(row=2, column=0, columnspan=2, pady=10)

tk.Button(button_frame, text="Load Image", command=load_image).grid(row=0, column=0, padx=5)
tk.Button(button_frame, text="Encrypt (Invert)", command=encrypt_image).grid(row=0, column=1, padx=5)
tk.Button(button_frame, text="Encrypt (Swap)", command=swap_image_pixels).grid(row=0, column=2, padx=5)
tk.Button(button_frame, text="Decrypt", command=decrypt_image).grid(row=0, column=3, padx=5)
tk.Button(button_frame, text="Save Output", command=save_image).grid(row=0, column=4, padx=5)
tk.Button(button_frame, text="Clear", command=clear).grid(row=1, column=1, padx=5, pady=5)
tk.Button(button_frame, text="Interchange", command=interchange).grid(row=1, column=2, padx=5, pady=5)

root.mainloop()
