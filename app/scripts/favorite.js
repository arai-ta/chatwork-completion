import {elementReady} from "./element_ready";

import starHeader from '../images/star_header.png'
import favStar from '../images/star.png'

const rootWrapperSelector = 'currentselectedroom'
const roomHeaderSelector = '#_roomHeader .chatRoomHeader__titleContainer'
const headerParentSelector = '#_adminNavi'
const sidebarParentSelector = '#_content'

const sidebarId = 'extensionFavorite'

class Favorite {
    constructor() {
        this.favoriteItems = new FavoriteItems()
    }

    addMenu() {
        const parent = document.querySelector(headerParentSelector)
        const button = this.createButtonElement()

        button.addEventListener('click', () => {
            this.headerClickListener()
        })

        parent.appendChild(button)
    }

    createButtonElement() {
        const buttonImage = document.createElement('img')
        // buttonImage.src = '/images/star.png';
        buttonImage.src = starHeader
        buttonImage.classList = ['globalHeaderPlatform__icon']
        // Icons made by <a href="https://www.flaticon.com/authors/smashicons" title="Smashicons">Smashicons</a> from <a href="https://www.flaticon.com/" title="Flaticon">

        const buttonContent = document.createElement('span')
        buttonContent.classList.add('globalHeaderNavItem__button', 'chatworkCompletionFavoriteHeaderButton')

        const list = document.createElement('li')
        list.setAttribute('role', 'button')
        list.setAttribute('aria-label', 'Favorite')
        list.id = 'extension_openFavorite'
        list.classList.add('globalHeaderNavItem', '_showDescription', 'chatworkCompletionFavoriteHeaderButton')

        buttonContent.appendChild(buttonImage)
        list.appendChild(buttonContent)

        return list
    }

    headerClickListener() {
        const container = document.querySelector(`#${sidebarId}`)
        if (container.style.display === 'block') {
            container.style.display = 'none'
        } else {
            container.style.display = 'block'
        }
    }

    addSidebar() {
        const parent = document.querySelector(sidebarParentSelector)
        const sidebar = this.createSidebarElement(this.favoriteItems.getList())
        parent.appendChild(sidebar)
    }

    createSidebarElement(items) {
        const aside = document.createElement('aside')
        aside.id = sidebarId
        aside.classList.add('chatworkCompletionFavorite')

        const ul = document.createElement('ul')
        ul.classList.add('chatworkCompletionFavoriteList')

        let list
        for (let item of items) {
            list = item.toListItemElement()
            ul.appendChild(list)
        }

        aside.appendChild(ul)
        return aside
    }

    addFavButton() {
        const wrapper = document.querySelector(rootWrapperSelector)
        wrapper.addEventListener('mouseover', (event) => {
            // this is implemented forcibly and may has performance issue
            // it should be listened by _message class element but difficult to listen by this element directly
            const message = wrapper.querySelector('._message:hover')
            if (message) {
                // auto created message is not needed to save
                if (message.classList.contains('autoCreatedMessage')) {
                    return
                }
                this.messageHoverEventListener(message)
            }
        })

        wrapper.addEventListener('click', (event) => {
            if (!event.target) {
                return
            }
            const favTooltip = event.target.closest('li.chatworkCompletionTooltipFavorite')
            if (!favTooltip) {
                return
            }
            this.clickFavTooltip(favTooltip)
        })
    }

    messageHoverEventListener(messageElement) {
        const actionNavigation = messageElement.querySelector('._messageActionNav')
        if (!actionNavigation) {
            return
        }

        const firstChild = actionNavigation.children[0]
        if (firstChild && firstChild.hasAttribute('extensionFavorite')) {
            return
        }

        const favMenu = document.createElement('li')
        favMenu.classList.add('linkStatus', 'actionNav__item', 'chatworkCompletionTooltipFavorite')
        favMenu.setAttribute('extensionFavorite', true)

        const favIcon = document.createElement('img')
        favIcon.setAttribute('src', favStar)
        favIcon.classList.add('chatworkCompletionTooltipFavoriteIcon')

        const favLabel = document.createElement('span')
        favLabel.classList.add('_showAreaText', 'showAreatext', 'actionNav__itemLabel')
        favLabel.textContent = 'Fav'
        favMenu.appendChild(favIcon)
        favMenu.appendChild(favLabel)

        actionNavigation.insertBefore(favMenu, actionNavigation.children[0])
        console.log('added fav tooltip')
    }

    clickFavTooltip(favTooltipElement) {
        const messageElement = favTooltipElement.closest('div._message')
        if (!messageElement) {
            console.log('no message')
            return
        }

        const messageId = messageElement.getAttribute('data-mid')
        const roomId = messageElement.getAttribute('data-rid')

        const roomHeader = document.querySelector(roomHeaderSelector)
        const roomIcon = roomHeader.querySelector('#_subRoomIcon').getAttribute('src')
        const roomName = roomHeader.querySelector('._roomTitleText').textContent

        // probably no problem to get first img element...
        const speakerImage = messageElement.querySelector('img')
        const speakerIcon = speakerImage.getAttribute('src')
        const speakerName = speakerImage.getAttribute('alt')

        const message = messageElement.querySelector('pre').textContent.substring(0, 1024)
        const date = messageElement.querySelector('._timeStamp').textContent

        const favoriteItem = new FavoriteItem(messageId, message, date, roomId, roomIcon, roomName, speakerIcon, speakerName)
        console.log(favoriteItem)
        this.favoriteItems.set(favoriteItem)
    }
}

class FavoriteItems {
    constructor() {
        this.storageKey = `chatworkCompletionFavorite`

        const favorites = this.getFromStorage() || {items: []}
        this.favorites = favorites.items
    }

    getList() {
        // TODO sort by date desc
        return this.favorites
    }

    /**
     * @param {FavoriteItem} favoriteItem
     */
    set(favoriteItem) {
        // TODO check item count, duplicated item
        this.favorites.push(favoriteItem.toObject())
        this.setToStorage(this.favorites)
    }

    remove(messageId) {
        const index = this.favorites
            .filter(f => f.messageId === messageId)
            .map((_, i) => {
                return i
            })
        delete this.favorites[index]
        this.setToStorage(this.favorites)
    }

    setToStorage(favorites) {
        console.log(JSON.stringify({items: favorites}))
        localStorage.setItem(this.storageKey, JSON.stringify({items: favorites}))
    }

    getFromStorage() {
        return JSON.parse(localStorage.getItem(this.storageKey))
    }
}

class FavoriteItem {
    constructor(messageId, message, date, roomId, roomIcon, roomName, speakerIcon, speakerName) {
        this.messageId = messageId;
        this.message = message;
        this.date = date;
        this.roomId = roomId;
        this.roomIcon = roomIcon;
        this.roomName = roomName;
        this.speakerIcon = speakerIcon;
        this.speakerName = speakerName;
    }

    getMessageId() {
        return this.messageId
    }

    toObject() {
        return {
            messageId: this.messageId,
            message: this.message,
            roomId: this.roomId,
            roomIcon: this.roomIcon,
            roomName: this.roomName,
            date: this.date,
            speakerIcon: this.speakerIcon,
            speakerName: this.speakerName,
        }
    }

    toListItemElement() {
        const list = document.createElement('li')
        list.classList.add('chatworkCompletionFavoriteListItem')

        const profile = document.createElement('div')
        profile.classList.add('chatworkCompletionFavoriteListItemProfile')

        const icon = document.createElement('img')
        icon.setAttribute('src', this.icon)
        icon.classList.add('chatworkCompletionFavoriteListItemAccountIcon')

        const name = document.createElement('span')
        name.classList.add('chatworkCompletionFavoriteListItemProfileName')

        const date = document.createElement('span')
        date.classList.add('chatworkCompletionFavoriteListItemDate')

        const message = document.createElement('p')
        message.classList.add('chatworkCompletionFavoriteListItemMessage')

        const room = document.createElement('p')
        room.classList.add('chatworkCompletionFavoriteListItemRoom')

        const roomIcon = document.createElement('img')
        roomIcon.setAttribute('src', this.roomIcon)
        roomIcon.classList.add('chatworkCompletionFavoriteListItemRoomIcon')

        const roomName = document.createElement('small')
        roomName.classList.add('chatworkCompletionFavoriteListItemRoomName')

        profile.appendChild(icon)
        profile.appendChild(name)
        profile.appendChild(date)

        room.appendChild(roomIcon)
        room.appendChild(roomName)

        list.appendChild(profile)
        list.appendChild(room)
        return list
    }
}

elementReady(headerParentSelector)
    .then(() => {
        const favorite = new Favorite()
        favorite.addMenu()
        favorite.addSidebar()
        favorite.addFavButton()
    })
