import TinderCard from 'react-tinder-card'
import { useState, useEffect } from 'react'
import ChatContainer from '../components/ChatContainer'
import {useCookies} from 'react-cookie'
import axios from 'axios'


const Dashboard = () => {
  const [user, setUser] = useState(null)
  const [genderedUsers, setGenderedUsers] = useState(null)
  const [lastDirection, setLastDirection] = useState()
  const [cookies, setCookie, removeCookie] = useCookies(['user'])

  const userId = cookies.UserId


  const getUser = async () => {
      try {
          const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/user`, {
              params: {userId}
          })
          setUser(response.data)
      } catch (error) {
          console.log(error)
      }
  }

  const getGenderedUsers = async () => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/gendered-users`, {
            params: {gender: user?.gender_interest}
        })
        setGenderedUsers(response.data)
    } catch (error) {
        console.log(error)
    }
  }

  useEffect(() => {
    getUser()

  }, [])

  useEffect(() => {
    if (user) {
        getGenderedUsers()
    }
  }, [user])

  const updateMatches = async (matchedUserId) => {
    try {
        await axios.put(`${process.env.REACT_APP_SERVER_URL}/addmatch`, {
            userId,
            matchedUserId
        })
        getUser()
    } catch (err) {
        console.log(err)
    }
}


const swiped = (direction, swipedUserId) => {
    if (direction === 'right') {
        updateMatches(swipedUserId)
    }
    setLastDirection(direction)
}

const outOfFrame = (name) => {
    console.log(name + ' left the screen!')
}

const matchedUserIds = user?.matches.map(({user_id}) => user_id).concat(userId)

const filteredGenderedUsers = genderedUsers?.filter(genderedUser => !matchedUserIds.includes(genderedUser.user_id))



return (
    <>
        {user &&
        <div className="dashboard">
            <ChatContainer user={user}/>
            <div className="swipe-container">
                <div className="card-container">

                    {filteredGenderedUsers?.map((genderedUser) =>
                        <TinderCard
                            className="swipe"
                            key={genderedUser.user_id}
                            onSwipe={(dir) => swiped(dir, genderedUser.user_id)}
                            onCardLeftScreen={() => outOfFrame(genderedUser.first_name)}>
                            <div
                                style={{backgroundImage: "url(" + genderedUser.url + ")"}}
                                className="card">
                                    <div className="potential-match">
                                        
                                        <h3 className="about-name">{genderedUser.first_name}</h3>
                                        <p className="about-bio">{genderedUser.about}</p>
                                        
                                        
                                    </div>
                                
                            </div>
                        </TinderCard>
                    )}
                    <div className="swipe-info">
                        {lastDirection ? <p>You swiped {lastDirection}</p> : <p/>}
                    </div>
                </div>
            </div>
        </div>}
    </>
)
}
export default Dashboard
