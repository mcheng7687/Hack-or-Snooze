"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  //console.log(storyList.stories);
  putStoriesOnPage(storyList.stories);
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  let star = "☆";
  let starClass = "empty";

  for (let favStory of currentUser.favorites) {
    if (favStory.storyId === story.storyId) {
      star = "★";
      starClass = "fav";
    }
  }

  return $(`
      <li id="${story.storyId}"> <span class="${starClass} star">${star}</span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a><br>
        <small class="story-hostname">(${hostName})</small> 
        <small class="story-author">by ${story.author}</small> ${story.username===currentUser.username ? '<button class="modify">Modify</button> <button class="delete">X</button>' : ""}
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage(list) {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through list of stories and generate HTML for them 
  for (let story of list) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();

  stripes();
}

async function addNewStory (evt) {

  evt.preventDefault();

  const $newStoryTitle = $("#new-story-title").val();
  const $newStoryAuthor = $("#new-story-author").val();
  const $newStoryURL = $("#new-story-URL").val(); 

  await storyList.addStory(currentUser,{title: $newStoryTitle,
                                      author: $newStoryAuthor,
                                      url: $newStoryURL
                                      });

  $("#new-story-title").val("");
  $("#new-story-author").val("");
  $("#new-story-URL").val("");


  hidePageComponents();
  putStoriesOnPage(storyList.stories);

}

$addNewStoryForm.on("submit", addNewStory);


async function modifyExistingStory (evt) {

  evt.preventDefault();

  const $modStoryId = $("#modify-story-id").val();
  const $modStoryTitle = $("#modify-story-title").val();
  const $modStoryAuthor = $("#modify-story-author").val();
  const $modStoryURL = $("#modify-story-URL").val();

  //console.log($modStoryId);

  await storyList.modifyStory(currentUser,{storyId: $modStoryId, title: $modStoryTitle, author: $modStoryAuthor, url: $modStoryURL});

  hidePageComponents();
  //console.log("keep going");
  putStoriesOnPage(storyList.stories);
}

$modifyStoryForm.on("submit",modifyExistingStory);

/*
When starred (ie. favorites) or X (ie. delete) button is clicked, perform function as indicated.
If "star" is selected, adds or removes from user's favorites.
If "X"-ed is selected, deletes the selected story from DOM and API.
*/
$allStoriesList.on("click", function(evt) {
  
  const ID = evt.target.parentNode.id;

  //Adds to favorites
  if (evt.target.classList.contains("star")) {
    evt.target.classList.toggle("fav");
    evt.target.classList.toggle("empty");
    evt.target.innerText = (evt.target.innerText === "☆") ? "★" : "☆";

    if (evt.target.innerText === "★") {
      currentUser.addToFavorites(ID);
    }
    else if (evt.target.innerText === "☆") {
      currentUser.removeFromFavorites(ID);
    }
  }
  //Deletes story only if story is posted by the logged-in user
  else if (evt.target.classList.contains("delete")) {
    storyList.deleteStory(currentUser,ID);
  }
  //Modify stories
  else if (evt.target.classList.contains("modify")) {
    hidePageComponents();

    const index = storyList.stories.findIndex(function (ele) {
      return ele.storyId === ID;
    });
    $("#modify-story-id").val(ID);
    $("#modify-story-title").val(storyList.stories[index].title);
    $("#modify-story-author").val(storyList.stories[index].author);
    $("#modify-story-URL").val(storyList.stories[index].url);

    $modifyStoryForm.show();
  }
})

//Adds stripes to DOM stories
function stripes () {
  let row = 0;

  for (let story of $allStoriesList.children()) {
    story.className = (row%2===0 ? "even" : "odd");
    row++;
  }
}