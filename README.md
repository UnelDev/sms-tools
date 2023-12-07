# llama-sms

## Description

llama-sms is a program to interact with llama directly by sms.

## prerequisite

to work llama-sms requires

-   an android phone with sim card (for sms)

-   enough space for llama

-   ip liaison between computer and phone (usb tethering for exemple)

-   adb liason between computer and phone.

## installation guide

-   install [node js](https://nodejs.org/en)

-   install [llama](https://github.com/ggerganov/llama.cpp) nex to this repository (follow the installation instructions)

-   in llama/example create myChat.sh

    ```bash
    cd `dirname $0`
    cd ..
    ./main -m ./models/7B/ggml-model-q4_0.bin -c 512 -b 1024 -n 256 --keep 48 \
        --repeat_penalty 1.0 -i \
        -r "User:" -f prompts/chat-with-bob.txt
    ```

-   create .env file

    -   add `LLAMA_PATH="/opt/llama.cpp/"`
    -   add `MODEL_PLACMENT="llama-7b/ggml-model-q4_0.gguf"`
    -   add `PHONE_IP="172.168.1.254:8080"`

-   in your phone:

    -   install [macrodroid](https://www.macrodroid.com/)
    -   use file `Macrodroid_file.macro` in macrodroid (home->Export/Import->Storage)
    -   go to Macros tabs open macrodroid_file configure 2 first block (myPhoneNumber and serverIp)
    -   save macros and return in Macros tab
    -   check that the macro is enablel
    -   install [restSMS](https://github.com/Xcreen/RestSMS)
    -   start restSMS

-   run `npm i`

-   run `npm start`

llama-sms is launch congratulation !

## known bugs

llama sms will start llama in a subprocess, but it has no way of knowing when in is started. it is therefore necessary to wait until the llama has finished this launch, otherwise problems of shifting will occur.
