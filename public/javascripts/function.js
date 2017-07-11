/**
 * Created by SeoJoonSuk on 2016-11-26.
 */
function showSub(obj) {

    f = document.forms.select_machine;

    if(obj == 'All category') {
        f.SUB0.style.display = "";
        f.SUB1.style.display = "none";
        f.SUB2.style.display = "none";
        f.SUB3.style.display = "none";
        f.SUB4.style.display = "none";
        f.SUB5.style.display = "none";
        f.SUB6.style.display = "none";



    } else if(obj=='Software'){


        f.SUB0.style.display = "none";
        f.SUB1.style.display = "";
        f.SUB2.style.display = "none";
        f.SUB3.style.display = "none";
        f.SUB4.style.display = "none";
        f.SUB5.style.display = "none";
        f.SUB6.style.display = "none";


    }else if(obj== 'Media Technology'){

        f.SUB0.style.display = "none";
        f.SUB1.style.display = "none";
        f.SUB2.style.display = "";
        f.SUB3.style.display = "none";
        f.SUB4.style.display = "none";
        f.SUB5.style.display = "none";
        f.SUB6.style.display = "none";

    }else if(obj== 'Electronics'){

        f.SUB0.style.display = "none";
        f.SUB1.style.display = "none";
        f.SUB2.style.display = "none";
        f.SUB3.style.display = "";
        f.SUB4.style.display = "none";
        f.SUB5.style.display = "none";
        f.SUB6.style.display = "none";

    }else if(obj== 'Mechanical Engineering'){

        f.SUB0.style.display = "none";
        f.SUB1.style.display = "none";
        f.SUB2.style.display = "none";
        f.SUB3.style.display = "none";
        f.SUB4.style.display = "";
        f.SUB5.style.display = "none";
        f.SUB6.style.display = "none";

    }else if(obj== 'Mathematics'){

        f.SUB0.style.display = "none";
        f.SUB1.style.display = "none";
        f.SUB2.style.display = "none";
        f.SUB3.style.display = "none";
        f.SUB4.style.display = "none";
        f.SUB5.style.display = "";
        f.SUB6.style.display = "none";

    }else if(obj== 'Architecture'){

        f.SUB0.style.display = "none";
        f.SUB1.style.display = "none";
        f.SUB2.style.display = "none";
        f.SUB3.style.display = "none";
        f.SUB4.style.display = "none";
        f.SUB5.style.display = "none";
        f.SUB6.style.display = "";

    }
}


