import UIToolbar from './toolbar'
import BidAskCathedralLogo from './logo'
import UITopBar from './topbar'

export default function Layout(){
  return (
    <>
      
      <div style={{border:"2px solid red",height:"8vh"}}>
        <UITopBar
        logo={<BidAskCathedralLogo size={38}/>} name="Bid Ask Cathedral" 
        description="From Market Intuition to Market Science">
        </UITopBar>
      </div>
      <div style={{border:"2px solid white",height:"5vh"}}>Tool Bar</div>
      <div style={{border:"2px solid blue",height:"70vh"}}>Main View</div>
      <div style={{border:"2px solid yellow",height:"10vh"}}>Bottom Bar</div>
    </>
    )
}