const Logo = ({ size = 160 }) => {
  const scale = size / 160;
  
  return (
    <div 
      className="flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div 
        className="relative flex flex-col items-center justify-center gap-2"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Top stripe - smallest */}
        <div className="bg-gray-800 rounded-full" style={{ width: '60px', height: '12px' }}></div>
        
        {/* Second stripe */}
        <div className="bg-gray-800 rounded-full" style={{ width: '90px', height: '14px' }}></div>
        
        {/* Third stripe - widest */}
        <div className="bg-gray-800 rounded-full" style={{ width: '110px', height: '16px' }}></div>
        
        {/* Fourth stripe */}
        <div className="bg-gray-800 rounded-full" style={{ width: '90px', height: '14px' }}></div>
        
        {/* Bottom stripe - smallest */}
        <div className="bg-gray-800 rounded-full" style={{ width: '60px', height: '12px' }}></div>
      </div>
    </div>
  );
};

export default Logo;
