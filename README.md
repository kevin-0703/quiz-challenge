# Take home challenge
If you are here I suppose that you have completed the Quarks Grouup internship program form. The next step is to put your skills to the challenge through a small take home project.

## Introduction
....

## Objectives
Our objective is to verify the following elements before we can integrate you:

1. Can you actually write basic code?
2. Can you build beautiful interfaces?
3. How fast can you deliver?
4. Can improve based on feedback?
5. Can you use collaboration tools like git, GitHub and Trello?
6. Can you read documentation?

## Instructions

You are going to fork this repository and complete the introduction section with information about yourself then from there it's you. But if you are no sure how. Follow these steps:

1. Fork this repository. This basically means to make a copy of it hosted on your username(you need to be logged in on GitHub)
Visit https://github.com/quarksgroup/take-home-challenge Click Fork button (top right) to establish a cloud-based fork.

![Screenshot from 2021-03-26 08-51-37](https://user-images.githubusercontent.com/17580572/112593802-b14a7580-8e10-11eb-9aa0-22c12213b657.png)


2. Make sure you have git installed git on your machine(https://youtu.be/nbFwejIsHlY). Then clone your copy on your machine.

```sh
# using ssh
git clone git@github.com/<github_username>/take-home-challenge

# using https
git clone https://github.com/<github_username>/take-home-challenge.git

# better yet using the github CLI(gh)
gh repo clone <github_username>/take-home-challenge
```

This where you get the urls to use in the previous step but remember to clone your fork of the repository and not this one:
![Screenshot from 2021-03-26 09-00-36](https://user-images.githubusercontent.com/17580572/112594639-e905ed00-8e11-11eb-82f2-1046062cb917.png)


3. Update the introduction section of this README.md and make a commit

```sh
# stage the changes
git add README.md

# commit the changes to git tracking
git commit 

# or if you don't want to deal with your text editor
git commit -m "Message about what change you just made"
```

If you are in any trouble making commits refer to: https://www.atlassian.com/git/tutorials/saving-changes/git-commit

4. How to make a good commit message for your future self and your team.

* Git commit messages matter because they give other members of the team a clear overview of how the project has evolved. Please carefully read this guide Why good commit messages matter

* Also this repository does not accept commits that are not signed. This has been put in place to make sure malicious forces don't impersonate in of us in this team. To sign your commits you can follow this guide: https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/signing-commit

5. For all the changes you will make you have to repeat the 3rd and 4th instructions for help.

6. The last step is to push the changes you have made back to GitHub.

```sh
# first a good developer mush make sure no one else has pushed changes they do not have locally
git pull origin main

# once that is done push their local changes
git push origin main
```

## Final words

We have provided help with the git workflow but now your project is done and has to be deployed somewhere. And that is part of the challenge. You have to choose a privoder to host your portofolio. Some will go with GitHub pages, Netlify or even Heroku, But hey don't limit yourself we want to see the explorer in new.

## Note

* Your should indicate where your project is hosted in your portofolio's footer.
* If you encounter a challenge you can open an issue on this repository and decribe your problem. You can even include some screenshots.![Screenshot from 2021-03-26 09-36-43](https://user-images.githubusercontent.com/17580572/112598156-d7731400-8e16-11eb-9ee1-46b4de5c88fc.png)
* Remember reading, understanding and executing these instructions is part of the challenge.
