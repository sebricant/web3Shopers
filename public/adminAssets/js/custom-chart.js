(function ($) {
    "use strict";
    fetch('/admin/chartGraph', {
        method: 'get',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(res => res.json())
        .then((res) => {
            console.log(res,"hiii");
            let price = res.priceStat
            let yearly = res.yearly;
            let returnmonthly = res.ReturnGraphMonth;
            let monthly = res.monthlyDelivery;
            let daily = res.RevenueByDay.data;
            let country = res.countrySort;
                 
            let dailyArr = []

            for (let i = 1; i <= 30; i++) {
                for (let j = 0; j <= 30; j++) {
                    if (daily[j]?._id == i) {
                        dailyArr[i] = daily[j]?.total
                        break;
                    } else {
                        dailyArr[i] = 0
                    }
                }
            }

    /*Sale statistics Chart*/
    if ($('#myChart').length) {
        var ctx = document.getElementById('myChart').getContext('2d');
        var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',
            
            // The data for our dataset
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                        label: 'Sales',
                        tension: 0.3,
                        fill: true,
                        backgroundColor: 'rgba(44, 120, 220, 0.2)',
                        borderColor: 'rgba(44, 120, 220)',
                        data: [price[1], price[2], price[3], price[4], price[5], price[6], price[7], price[8], price[9], price[10], price[11], price[12]]
                    },
                    {
                        label: 'Delivered',
                        tension: 0.3,
                        fill: true,
                        backgroundColor: 'rgba(4, 209, 130, 0.2)',
                        borderColor: 'rgb(4, 209, 130)',
                        data: [monthly[1],monthly[2],monthly[3],monthly[4],monthly[5],monthly[6],monthly[7],monthly[8],monthly[9],monthly[10],monthly[11],monthly[12],]
                    
                        // data: [30, 10, 27, 19, 33, 15, 19, 20, 24, 15, 37, 6]
                    },
                    {
                        label: 'Returns',
                        tension: 0.3,
                        fill: true,
                        backgroundColor: 'rgba(380, 200, 230, 0.2)',
                        borderColor: 'rgb(380, 200, 230)',
                        data: [returnmonthly[1],returnmonthly[2],returnmonthly[3],returnmonthly[4],returnmonthly[5],monthly[6],returnmonthly[7],returnmonthly[8],returnmonthly[9],returnmonthly[10],returnmonthly[11],returnmonthly[12],]
                    }

                ]
            },
            options: {
                plugins: {
                legend: {
                    labels: {
                    usePointStyle: true,
                    },
                }
                }
            }
        });
    } //End if

    /*Sale statistics Chart*/
    if ($('#myChart2').length) {
        var ctx = document.getElementById("myChart2");
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
            labels: ["2020", "2021", "2022", "2023"],
            datasets: [
                {
                    label: "US",
                    backgroundColor: "#5897fb",
                    barThickness:10,
                    data: [233,321,783,100]
                }, 
                {
                    label: "Europe",
                    backgroundColor: "#7bcf86",
                    barThickness:10,
                    data: [408,547,675,734]
                },
                {
                    label: "Asian",
                    backgroundColor: "#ff9076",
                    barThickness:10,
                    data: [208,447,575,634]
                },
                {
                    label: "Africa",
                    backgroundColor: "#d595e5",
                    barThickness:10,
                    data: [123,345,122,302]
                },
            ]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                        usePointStyle: true,
                        },
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } //end if
    
    
})
})(jQuery);
