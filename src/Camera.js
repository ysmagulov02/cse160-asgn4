class Camera {
    constructor() {
        this.eye = new Vector3([0,1,5]);
        this.at = new Vector3([0,0,-100]);
        this.up = new Vector3([0,1,0]);
        this.fov = 60;
        this.speed = 0.5;
        this.rotationSpeed = 17;
    }
    
    forward() {
        // debugger;
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(this.speed);
        this.eye.add(f);
        this.at.add(f);
    }
    
    back() {
        var f = new Vector3();
        f.set(this.eye);
        f.sub(this.at);
        f.normalize();
        f.mul(this.speed);
        this.eye.add(f);
        this.at.add(f);
    }
    
    left() {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        var s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(this.speed);
        this.eye.add(s);
        this.at.add(s);
    }
    right() {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        var s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(this.speed);
        this.eye.add(s);
        this.at.add(s);
    }
    // got help form the tutor (Rohan Venkatapuram)
    panLeft() {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        var r = new Matrix4();
        r.setRotate(this.rotationSpeed, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        this.at.set(this.eye);
        this.at.add(r.multiplyVector3(f));
    }
    panRight() {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        var r = new Matrix4();
        r.setRotate(-this.rotationSpeed, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        this.at.set(this.eye);
        this.at.add(r.multiplyVector3(f));
    }
}