import { useState } from 'react';
import './App.css';

// 💡 키노라이츠 이미지의 영화들과 AI 분석 내용을 섞은 가짜 데이터입니다.
const mockContent = [
  {
    id: 1,
    title: '파묘',
    type: '영화',
    poster: 'data:image/jpeg;base64,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',
    platforms: ['Netflix', 'Wavve'],
    aiAnalysis: {
      score: 95,
      summary: '토속적 신앙과 현대적 연출의 완벽한 조화. "긴장감 넘치는 전개와 배우들의 호연"이 돋보입니다. Gemini AI는 이 영화의 흥행을 강력 예측합니다.',
      keywords: ['#오컬트', '#최민식', '#김고은', '#몰입감']
    }
  },
  {
    id: 2,
    title: '마션',
    type: '영화',
    poster: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsRN6TYlnFFEBvovLaVE32jx1ogMtKgU1YjE-xGTVN8WzTiWvBcFE4HpGHDnRXvrwjaqEDEAhhKoFKzJqczuOzXnChcjSi6r-VZ8olPbxYlg&s=10',
    platforms: ['Disney+', 'Wavve'],
    aiAnalysis: {
      score: 91,
      summary: '과학적 고증과 유머가 살아있는 우주 생존기. "맷 데이먼의 1인극 같은 연기가 훌륭하다"는 평입니다. AI 분석 결과 긍정 리뷰 비율이 매우 높습니다.',
      keywords: ['#SF', '#우주', '#생존', '#맷데이먼']
    }
  },
  {
    id: 3,
    title: '삼체',
    type: 'TV시리즈',
    poster: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMSEhUSEhMVFRUVFhkYGBgXFhUWGhUXFRUWFhgVFxUYHSggGB0lGxcVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGhAQGi0lHyYtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSstLS0tLS0rLS0tLf/AABEIAREAuAMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAAEAAECAwUGB//EADwQAAEDAgQDBgUBBwMFAQAAAAEAAhEDIQQSMUEFUWETInGBkbEGMqHB8NEHFCNScuHxQoKSFTNiosIW/8QAGgEAAwEBAQEAAAAAAAAAAAAAAQIDAAQFBv/EACwRAAICAgECBQIGAwAAAAAAAAABAhEDEiEEMRMiQVFhFPAFMoGhsdFScZH/2gAMAwEAAhEDEQA/APIwnSISTkBiowpJFAxGEgrGNT5VqDZVlUoVmRaTPh7Elr3Ci4in88ZZbFMVSC2ZnIQYidtbI0azKDVLKtj/APNYoOa3sTLhIh1Mg2pkd4OiSKtKBMntGxMqGE4HiKtR9GnSLqlOczAWBwhwaTBNwCQCRMSOaKQLMzKnhao4DiMrHdkYqEBhlveLoyjXUy2Adcw5hDYXh9SoCWNnLM95oNhJ7riCbA6BEAGApBq0afBK5y5aZOYS2HMIcJixB52jWbapVeEV2BxdTIDSQbtsWsNQ2n+VrjOliNbLGAQFIBG1eG1WODHMhxeWAS0y8ZZbIMWzt336FEUeB4hxLW0iS0EnvMsA99M3mDDqbxbdpRoRsz2BWgJmBWgJ0iTZXCkbqUJAJqFsiE4TwnAQoI7QkrGNSQo1mAUwCknAUTpIgJ4UwE4ajRiICm1qkGqQCKQCIGy12/EGJyVafa9yvPajJT/iFzBTcScsyWgSdZk6klZgarGsTUazQq8fxLi0uqAlocB/CowM7Wtd3ckEkMaJInXmZhhuNYinVdXp1C2q8kucGsl0mSILYgm8ARYWsIDAV2ELA9pqNLmT3mgwSOhkQUaBYS3j+JDGU+0GSm5rmNLKRDXMcXNPyySHOJvuqcHjqtMODHxmnNLWOJkQe84E3E77rRfjsDDYwby4VST/ABqjWupFrw2nOYkEEsM692Juhq1XDywtpvgVS5zZjNSLyezz5jcMygGAbuJJtGRm/kZ/HsRmzdr3ueSn0v8ALc2F9bDkq6/GK7w4OqTmJLu6wTmY6mbhthlc4RpedboqnXwgEGg83bcuJsBTkd17dS2rP9YgiFn4sML3GmC1hPdaZsOVyT9SskByLa/FK1Rwe95LmvLwQGth7ssuGUAD5G+nUovCcfxLCS2qQSA0nKwyGlxAMtO73evQRm0hGysATqJJyYmtVgaogKxoT0SchsiiWq0kDVItWMikBWNYptYp0mjQbW8LD7QgMJrUlaGp0KAcunAThqkAoUdQgFMBOFY1qNGK4UoVhaogI0aybW2U6dMkhrQXEkAAakkwAOpNlKmAu8/ZNwNtXEnFVB/Dw1xOhqkW/wCI73QlqL4VgSt0blb9kVIYYltaqcWKWbLmp9makfLGTNlLgQDmXmnAsAK2Jo0H5mipVZTdEBzQ5waYkGCOoXZYb4+P/WP3ouIwzv4EHQUJ7tSOYd/EO8OcEf8AFPw/+78ZwtdgiliMRTdbQVe0b2g85DuuZ3JKm1wx2k+Uct+0H4ZpYDEso0XVHMdRbUJqFpIcalRpEsa0RDBtuVzLwvZP2ofF7sPnwIohwr4YzU7Qty9oalP5MpmMk6jVePQnhbXJPJSdIjTpk6KbqVrJm8grHaWXF1GTLDLGKa5++T6T8L6To83R5ckoSbS57enPk9nXexmM2Uiy0pMabypE930QWeby0pcXFcdu3JV/h2CPROUsdS0yNbfm4ktb+UiIapAKdMIllDkvVPi6B2qVMSNQeoCIbSuQNQRPh/iU9HDgOIbE2zDlrBMafnNI2VjHgg2lKmKaJdTIEwT4QfNTLFrDQIWpIg00kTUcc1TAUWtV7GrnRZjBqtYE+VW02JkgWVuCTWq1zUsiegWMF2P7NqBxGIdhalSt2Bo1HGmytVptJmm0ktY4AyCQZ1XINauv/ZlxGjh8aalao2mw0HtzOMCS6mQJ8j6JZLhhi/MjpcdwT4fovdSqPyvYYc01MSYPK1kdR/6NWdSpNxld7g9opNOKxpy1PlYWS6GkTAIiFRxLAcCr1X1qmKbnqHM6KxF4iwjoocP4ZwGjVZWZimh9N7XtmuSJaQRIi9wp+nqW9fQ5f9q3Dm0MZTY11VwOHY6atWpWdJq1hAdUcSBbTTXmuPJXYftV4pRxOMZUoVG1GDDtaXNMgOFWsSPGHD1XGlXh+VWc2R+ZkmC6m28qDIgqbGrgzYpZHklXaq/Tk+m6Dq8fTQ6bE2qm5OfP+XlV+3HPI4J3U8lo8EshKupsM9FJQfjJqNK4vt8HbLPH6FwnkUpKGVW5W35lXr6pcfA1OiiqVE6X8jH1TtYNUbSob6xtuvVbPi4xHpMM3FoF9zrP29SisPhhF93TPjAH0AU2Mt+fdTwzC2mGtABDe7J05AwkZSiD8PGqqNEahbDmAiCgcJgixuQxAJywI7uoGUAAb6W0Q35NrwBGkkjalFJbY1HndNqIY1RaxXsYskBiyKWVSDUzk6AxAJ4SYpSiKRDVLKr8DVZ36dSGl0uZUMkANaD2eUaEmb35RuqS4j+10qlYzhXJWVBym53ilTbmIA1JgbXO0m26a0I0yqE0SiKtBzSWuEEGCNwmDYTWKNTai6bUL2nIeqyse2o5wDnEzFrxqQLeim8iKxwt9zoG42k0gZxMiIuZ200utIYS8/c+y5D4fZJzkCZHIBoB5Ls8KHZZIJ0tobzt+eyV5eSiw12Kq7MjC7W9pgawAPqrqNEloMwTEwBeyLZRDhGXuxF/CIjXeLqVKp38pHgdjBMi+45eCm5e5RR4Ih0Nl2htvuYiPNUfvjhVDLN2AJ15Z3Xg+A33Wi6iHHKQducWJIjrMfRTq0RBaYAqECzRJNiL/wC2NtUs2/QaKXqNSBDYHzRq68u5mNb/AIE2FrPIPaNDSDFjId1HIK97TADbyYJ8D3ietiPFM5iZCNFbwknLUlgUcAwK5kKpqkArESTrKCmUwRAx2lSAUQkmSFIVTDpgHuwfr6G5T4V5IIcHAgwJtPM+yrxNiD4+ekj6IpjTAP5ySKPmKOXkEWKYpDdIWElZlbGOcSBpy/VPKcYkY45TfwFOINmD86KTKKr4a7Ucvv8A390W9cspNnXGCj2CadSlkyupd/LAeHHWdS3Tp5rD4mwvcQwSQBa/TX15rSYbxCc632U7ovGNjfDNENzTOrtNidncrT6LpqAguNyANBfTYADXfndZnAg0CpeO+DH82YOmT0W5hxuDA1naxBieVku3IzjwEMpqZYJkjTSetre3NWFpsIsdTbedj5IfEYWrIdmFndxrQInK4jMDvAKMpiRiSwlJwY7tDcTNwYEWJ6xdXUgxw1LsvSbiINhr+qrweLcXua4g3AHde06XGkaytDRsxpcx6lZO0aSp8kcqrqUlewA3BkG/iplqeydUZzqaSLfSSQsx5c0KZKoD1OV1HOSzKTQqwptcjZqLWUpVowx5J6LiESKpRti6gGMwZygzEEec92PUhaZLGUWlobLS4OgyT8pa4jYZSB5IPGVRkdPLTmRe30Wbia2YiNhFvT3XNknzwdWPHUeR8RiC92qor0wO8N9VFqnXoy2xuPr0SWMF4aiGXOu55DknfX5fl9EHUqPawAggxad50PoqhUcIncW3mStY8YmizETNrc/zopMfmUKeHOWdttpOkqykDZrLnkNBG7ipSkdMIBmCrhtQWBsSRHKD+q6yjR7SkC490xANsxvAJ1123WBwjhA/7jjIG+znfytG/Urfw47SHZXEico2Fu6G3jQ6nmpuYZQDG1YjMRy3jTmVZSaHHumYva4vN59dERgGtqsy97KNblpmZLHEGd4IU38IBdLXObeSNiTBsOXRHci4KytlM2i/X/CfDYVwMuMm/gLzZaTadw0iSbkjQR/dX9im3ROmZODwha3KdATHRsmB6IkUUd2Kbs1tkgNNuwI0Ukd2adDc2p4Q1qJaOis/dOSm1sbLs3OfRruMxg5K6nSbKnTphG0MJKRzHURYak2VPH1GtFgLbn2H5/Z8UezHdEmPRc9xDEvdYwEjlfYrGPuVY7E5jyMR5fmyDoXj08/8qtzL3M9FbRotbAAuh2HqyT9fz0VNSs6O4YO0XkjZF446OE3+k3tOuh9FnDERNp6zC1h1FS4u55DnnM62umUaADzJlHMxAeQ4mbQAPSOn91g9mXOJaIB+63MBgyAJHgLT4kpZOiuOAd2pI5Dp9lqcLwpLMzgWUhoB81R2gA/VSwHCmtGesNpazd3jyHutdtB9YxcBoho7rbm0NabHp48wueUjoSDsLRdULWty90WbM20EDyPWx8FdXDmFpMg6jNy8PUSmwuFyOMQJEyNt/edPFamBoCo/M50uaTGYTIFgLm4v5QouQ+oRwt2ZvcaTOpJAkjWG+YuVrMw5ICbDUA0d206mIv1j2RdAGwdB1kx6WWc2iTgmRpYeAByUzSPREtaFLIEniMzxoBLFEsRrmKotCbxBXjBhTSREJLbi6HjNKDoruwlUYZi0KTOa7ZOiMFfcpZhEdSoQJiURhacoiphnFrixtmd3UDvEAk/8S3/kVPxCjxI5niBdJ3nXZYVVkm5HhIC38dhammXXqI91jVuGNYA8xM2uTdMpG0BW0hq63jZPVa0CRB8PeVc2gTe/1HgrKeBc68gBvks5FFjMoukEFvTTzHgfmuoUsP4XO3RbH7uDDWiev9kdhOHNbH80HlO1uQR3CsZl4Th18rWyfqtujgWsECHP9Wj7H8OienTJ0DGgG8uBJ55sumqLfimUQct3O2BEmb3ds24v4qMpMrGIXgSXODjobEETJIuM2sdfSFuYfDAAsa0y2oGyJ7xAAytb57rI+H8DUrlzg5rS3eJEuzAQDrpr4LqaDHUmZSQ+XEbNDWxMDlAm/UrncymtFeCwuYtABiQHHXvAXi/Q+ZC1OF0mw5tg8F0ADawB8IAsgKGHAeGjMwABzQCSMxIIkxAEEX6dVuUsAy3dBJbBcLSINiRqO8UlsMqSEHNABJaJy3zW71gRO0iNpRYpKTGR5WUwjRFsiGJ4U2qaOgNiktUezRCUIaG2KhTCdWgJJtAbnjFHDBG08OmZbZFUXBWlM0YBWEw4XH/EGMxLKjyypUYM5BaHWGkW0u3KfAhd1hzoRos7j3BSSarGhwIh7CCR0fYyIvMc5g7JCdPkrLHa4PNMTi6z9a1Q/wC8j2KnwzDOLw4yZEEk+F5W7iMEaUvGGcWzEsyu0EzMTli+bSBMqpnEQ7Rhn/yOnkAqufHAIQ9w6lhqbRYl55XDf1KrxjR/qPg0aDyH5dB1KtQ3zANmCQQLc559La+hHCsHUqvysa5zv6iALGC5wBGsdBAvEpEO+Cuk57rMAaLAlx70HUidhuAqhTyGSZJiJvm3Mt5adZBIvddfwbgDDDqr6stMEBrwxpE2NUgtdGljrPlo0/gzDOdna81IBzEOa502ggiw38ZWc0J/s8/xuMqBwYG5SIBJOa9tORHiptpljnEEyx+ptMwAR/Zdpxv4JDA1+HMRYtcRFt2nUHaBr468fjWuZVqsdEh5aectd49FOUrOjGk+x3nwVQy4fN/O4nyHd9wVucMw2aq9ztGgAW1LgN5vEH1WB8O8UD6LWMaAWtDYzic2kkRaTJHgeS7DhlINaYMyZnmDZp9BPmpxVsTN5bB6NDM+pUdoXEEEGYa3LHr9kdhh3dwLxNiBsI5DRITmI0aAPMk/Ye6Ia1NFHPOZCElaWKJamaETIhOE+VSa1FI1iappQkmEsSSZJEB5MziAiS0HqP02V1DF03dD1/Vc2HIzC30lQZ6SgmddRiEXSeea5vB4hzd4HqPRamEx2YwLHlz8FJyKLGzXbhKb7vaCffe/NVYv4Vw1SmWhvZkx32QX2M/M4EpqeIKOpYkoxlYk4S9DmOJfAQJJZWMWhrh9JBjfcIjhPwv+7kQ4lt2lpdY/yl0N9o0F4md+pUJVLySCFWydN92QwpdRqCcuSqYsD3agAy6kwHtBE8w2wLlq1KFN3zMa7lLQfcLKfTkEEEzFySbgggxOoIBnoj6VR2/simTeNhAa2mJvFrS4gcoG3kvH+LRUr1aoJAfUc4SBaTIBM6rtvjfimRjabXO7QmYa6BlIc05gNbSuGx5ktOggGPKPXqUJyOjBjrlm98I/M4c3Mkf8hy6henUYItpePA+Gl/ZeW/D9UCoR/M0gf1CHt/8AZoC7jh/GBES0AQO8YMnYN/wpY5pdw9TilLsdA1T7RBUa1r738J2UjW6FX2Rw+G7CjVTGohHVwqv3ockryDLEw/tVNrkC2s07q5tQc0VMWWMLBSJVIrDmExxDeafZE9WXSmQxxQSQ2Q2j9jx+lhXDVqNZhNyIWrTpnk70Km5p5O9HKMj0YmV2B/yrmYdElvQ+hU6dI8j6FQkdMWX0GuMZnG3X35oum0/zH1QrKZ5H0V7GFaIsuQxhd/NPonk8/oqmhD4nGsYNZPKVXYloalF/T6q+s7K0uEWGkgTt8x0C4zE/E2WzInzWLjeKvrTL45b+SKmDwbHq4k1XvqnLJmA8AhrdmgnodbIfEszXAAI/09Om3+VXh3EnK6D0Mtv4qeRwJIkDkD+iWUi8Y0jR4f2jSHNE5SDYT4HT+y0MFiSHTvuUJw7Fdw3g5tJOltp8UXRp5gCHTpaInxO65ZdzoSVHVU8a5rQZBDh1Om4On36LUY8OAM6hcdha5s3b8vP2W1gnQJOY30FoJ35QqwyHJlwJI13UxzCr7HqPVQp/LJ5gevVIgqjfwQUa9ROYNnfRQCeEoS2NQ/aKLq3ikWqDgUbYtIXalJRvySQ5DSByVDOha+PptBJeLaxc/RZOJ+JKQ+UPd5R7qzTMjdJUS8LnsLxwvOjWt8S4+gED1RI4i12knyUmVSNU1lJlVZjKjz/pA81YHEcktj6l3FKbnMMOI8CuTfReTdxK6PH4mGEAjMdlgtpuOqBWC4AXYUgqr9zdqFuMoi1lOlh3E5QEd2M4xMGpReFfhajhbKeS6hvB515KTeENG6zdguKOao4ci8LRwQcIhbbeHMGxPWdEXh8KwaN9VNqw+IjIZroPVamGqO/lJ8PvdGNotmYCvY0IqBOWRFbC/YEdP7q5janQK1itBVFA5pZPgup6XN1LMqZSzqyOdqy6U0qrMmL0bF1LSUlQaiSGwdTzJ77nks+s+DaEe6ntKBxOHOyey6RSOIEbBEUONP3At5IB9MqynIGgullFFINmgeN1TZsDyn3VrMS93zOPkYQdBh5QjcNrFvv6KUkdEXQdRp2spU6cu1VmGwDt3QOS0aWHa3QIageQqp0GtMnveyPZVGwhU5QVIiNlqJ7BM7qDyk0oHFcWpNrMoF47V4Ja2CZABNyLCwOvIo62DajQar6aDa9EMekDYSCrAUMHqYqIisKa5WNegxUT9qjZNxDe0US9C9smNRHYXUKL1AvKGNbrokKq1h1CA5Mqe0TIGo4CrU5/5Q9SoDpH2VFR4duqAQL8/wA0XTqLuXudPJUVHwbaJu0Q1V/6c0VALyFzcdstnhbgbyubYDNtytzAWAlacTLI2dJRrDmiaVULAbVvYoiniIUqG2N4VApOrBYoxfspOxK1GTNbtuS8o+JsY/D8UNVju9maZcJgOaA4X2gkWXfsqka+0fdcJ8YcOL8awzZzWG451wwj/wBwrdPWzv2JdRLypr3PT2Vd1cKizabsoAmYAHLSyu7VctHRsGtrKYrIHtOoTdqOf5yQo1hxrJ+0KzxiPwXU210KBYd21tU/bfmyDFTqnNRGgWGdqouchm1OX3Th/ijQLChUSQwKSNAs86m+8qNXn9dLqBdJj7fnqmL43PRd9HJZY0JClKqGIkWv+boig/MQ0BxcbAASSTAAAEyZ8UGgpiazLf6oxj9P1Qz8NVDoNKqHCbFlQHukAy2JsXtB5ZhzCnTpPJDW03y4gNAa6XHK10NEXOVzXRycDoUHEOwZSrDmrHVvz+6AqU6jfmpvaAby1zQIcW3J/wDIFviCFE1uYBiN+qm40XxQnkdQVh4qHp+iubXsJMLMFfpz3UDiTrzv7JaRb6bL8f8AV7X7m1Tr7ysTjNQOxOHAuTOYAkw1j6dUOPIZmR5lB4vF1XENp2B1fEkeqs4RR7EGTL3G7umsX2m/VPFKPJKWDJO0l27/AKVf8nT/ALwfwKTMX1nw9vwLHdiY05+PM7XlF8Pp1K0hmUQLl720gJOUd55FySABKnoBulbDzi50P1H5z2Uu05n2VDODYiAckd/siC8fP2vYwZ3D5ETMX0umweCq1GGozKQM0AuaHO7Nud3Z0ycz4aZOUFZ42bxF7hbax2PspdqqXcLxALZaBma0tJfTAOZ3ZtE5tS6QGkzPqqaFN5LW2Be0ObmcG2JgC/8AqJGmtkvhs269zQZX6/X6KxlSdD+mvuqqHDKrnAN7NxIBH8RneBeWWg3hwg8kO4ubAPJrtRo5oe0yOhCzg0DZPsHip6KYqDn7LPbV0/Tn4K0VPyft+qFGsML/AMj8CSFNTf0nb1SRoFnAOq/lvBCmv0jr4fVDuqjTXoCmFbmD52+y9DU49gnthOv38LiIROA4kaNRtVkZmk2cCQQ5paQbgiQSJBBvqspz/XzunzeXqjQNjr6XxxiGNFNraAYGtY1hbULQ1mQNaDnzC1NgJzXGskAgI/ELyactZlp06lJtM9rl7OqKge2S8v8AlflBDgYawTaVznafhmPGSrWPgfpzQaMqOpx3xZXr0zRqdmGHKAA0gtDXl/dJcTeQ0zMim3cEnN7Ycx+f5WX2hI/PwhTbXvr9/uklDbudXTdRLBK4ff3Rotrax+b8+qRqiYJgxZZ5xEnpPLT7qwV/P8+qXw0VfWZG277/ANV/DDS/829Us/X2QWe3L1+iWeLkn39oS6D/AFk6apc3+9f0g1rtyfM6fVafBeJU6VTO/tJaO46maeZjtzlqNc1wIJF9Fgdqfz8CkK1hP6lGqOeU9lTPQsD8a02yTSq3q1KmUPD2DtKheAJcNO7sLyRErG4PxOjSovaaVTtngt7Vjmd1hEFjczTEycxF4sCJK5c1p/AfdLtj4+MT5XhF2KoxR2vBviNtIUwWuHZ0XU5blIcX1zWmDFocR4pDj1NuIFVrC1opZGhsMykHMCGBwETsC3Y7X45lYGLRry9LXVjasG3vPpOiXkOsTs3fE7e0bUaxxymnJLokNqiq4NYS6C7LTbOYizrXWdicd2j85zfKwEkySWUmMLiZvJbPmsDtztc21AH6KynUOlx4kX8xf6pXbCkl2NsP2AGnSR6hWivtv6feQsdmKnmOsk+hsVcx+oDjrfSdJ5eCShjWbW1+Y84J6czqmWZ2oInUnoRPTWCktqA4w6eqpdukku44iFLbw+5Uj83mkkiAc6jx+6YaHxKdJYJefuoN1/3fcpJJRi6lt4FTp/6vBJJKOhmfKP6fsFSNPRJJZGYRt5fZWD5h4H7JJJRyNbUeP2KIoJJLMK7kD/8ASTvv90kkAl1D5D4q6l8vmfdJJLIKLcPp5n3ClT+UeJSSShDqX/aP9I+ySSSUx//Z',
    platforms: ['Netflix'],
    aiAnalysis: {
      score: 89,
      summary: '원작의 거대한 스케일을 영상으로 잘 구현했습니다. "과학적 상상력을 자극하는 스토리"라는 리뷰가 지배적입니다. 복잡한 설정을 Gemini가 요약해 드립니다.',
      keywords: ['#SF', '#미스터리', '#외계인', '#넷플릭스']
    }
  }
];

function App() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="app-container">
      {/* 💻 GNB (상단 네비게이션) - 키노라이츠 느낌 */}
      <nav className="navbar">
        <div className="navbar-content">
          <h1 className="logo">Connected M</h1>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="작품, 인물, 컬렉션을 검색해보세요" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="user-menu">
            <span>알림</span>
            <span>프로필</span>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {/* ✨ Gemini AI 추천 섹션 - 우리만의 핵심 기능 */}
        <section className="ai-recommendation">
          <h2>
            <span className="gemini-icon">♊</span> 
            Gemini AI가 분석한 트렌드
          </h2>
          <p>요즘 뜨는 리뷰 핫키워드와 분석 결과를 확인하세요.</p>
        </section>

        {/* 🎬 검색 결과 / 콘텐츠 그리드 - 키노라이츠 느낌 */}
        <section className="content-section">
          <div className="section-header">
            <h3>통합 검색 결과 ({mockContent.length})</h3>
            <span className="more-link">더보기 ›</span>
          </div>
          
          <div className="content-grid">
            {mockContent.map((item) => (
              <div key={item.id} className="content-card">
                <div className="poster-wrapper">
                  <img src={item.poster} alt={`${item.title} 포스터`} />
                  <div className="platform-badges">
                    {item.platforms.map(p => (
                      <span key={p} className={`badge ${p.toLowerCase().replace('+', 'plus')}`}>{p}</span>
                    ))}
                  </div>
                </div>
                <div className="content-info">
                  <span className="content-type">{item.type}</span>
                  <h4>{item.title}</h4>
                </div>
                
                {/* 🤖 Gemini 리뷰 분석 박스 */}
                <div className="ai-analysis-box">
                  <div className="ai-header">
                    <span className="ai-score">🟢 {item.aiAnalysis.score}%</span>
                    <span className="ai-label">AI 리뷰 요약</span>
                  </div>
                  <p className="ai-summary">"{item.aiAnalysis.summary}"</p>
                  <div className="keyword-tags">
                    {item.aiAnalysis.keywords.map(k => (
                      <span key={k} className="keyword">{k}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;