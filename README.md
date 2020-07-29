# Stack Helper README

## Check it out:

https://marketplace.visualstudio.com/items?itemName=Arnav.stackhelper

## Inspiration
The inspiration came from something that I wish existed and was well supported. I wish that I could find answers to my errors without spending time running code, searching for answers that could take hours of valuable time. I know that I was not the only programmer that has this issue. Beginning Programmers and Veteran Programmers alike have this issue as well. This could save programmers that are new to programming to easily find errors without having to search on Google for the right answer. If I was a beginner, I would need this extension. This extension could have saved me and save others from their valuable programming time, and help beginners learn as well to find the best answers on Stack Overflow.
## What it does

This extension has 5 specific commands that can be used. 

Search StackOverflow
Find Help with Errors On Stack Overflow
Enable a Line by Line Error Highlighter
Disable the Line by Line Error Highlighter
Search in Stack

Search StackOverflow Provide an Input Box for the user to type something that they want to search on Stack Overflow. It then opens related searches in the default Web Browser in Stack Overflow's website.

Find Help with Errors On Stack Overflow reads the debug console to find errors. It then suggests the user to choose an error to search Stack Overflow and then opens a link to the default Web Browser.

Enable a Line by Line Error Highlighter finds errors while a user is typing and shows the error in realtime without running code. This works for any language!

Disable the Line by Line Error Highlighter disables the error highlighter if a user does not need it anymore.

Search in Stack uses Stack Exchanges API to find relevant articles. The user highlights text that they want to search, right-click, and enable the extension or use a keyboard shortcut. It then provides a list of Stack Overflow articles and shows which articles have answers and which do not and show the upvotes/downvotes of the question along with the title and author.

## How I built it

I used the starter extension code by using the yo npm module and wrote the extension in TypeScript. I used the VSCode API and Stack Exchange API to bring the extension to life. 

## Challenges I ran into
This was my first time making extensions and I hadn't used VSCode many times. So I encountered many issues but overcame them. A very big issue I had was using Node.js and npm. I had encountered many issues as my versions were outdated and some functions deprecated. I overcame this by searching solutions on Stack Overflow and found my answer. Another challenge I had was running the extension, I would get error messages that would prevent my program to run. I also had the error to figure out how to use the Stack Exchange API, I didn't have much experience with this type of API, but eventually overcame it.  

## Accomplishments that I'm proud of

Running my first VSCode extension!
Becoming familiar with VSCode and how extensions work.
Bringing an idea that I've always wanted and made it a reality.



## What I learned
I learned so many things. I learned:
1. How VSCode can make programming fast and efficient
2. How VSCode extensions work
3. How to make a VSCode extension
4. How Stack Exchange API works
5. How APIs work

## What's next for Stack Help

Add more features
Make Stack Overflow available without leaving VSCode (Use WebView API)
Use Machine Learning to help find answers faster and rate the answers for a particular question a user had to make the Extension efficient and seamless.
Make errors easier to understand ie. implement Help50 from Harvard.

## Requirements

run npm install 
For contributing


## Known Issues

N/A Yet.

## Release Notes


### 0.0.1
Initial Release

